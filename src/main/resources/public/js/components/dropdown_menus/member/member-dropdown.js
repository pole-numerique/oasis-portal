import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

//Components
import DropDownMenu from '../../dropdown-menu';
import MemberDropdownHeader from './member-dropdown-header';
import MemberDropdownFooter from './member-dropdown-footer'
import CustomTooltip from '../../custom-tooltip';

//Actions
import {fetchDeleteMember, fetchUpdateRoleMember} from '../../../actions/member';
import {fetchRemoveOrganizationInvitation} from "../../../actions/invitation";
import InstanceService from "../../../util/instance-service";

class MemberDropdown extends React.Component {

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    static propTypes = {
        member: PropTypes.object.isRequired,
        organization: PropTypes.object.isRequired
    };

    state = {
        errors: {},
        instances: [],
        memberInstances: [],
        memberInstancesWithoutAccess: []
    };

    constructor(){
        super();
        this._instanceService = new InstanceService();
    }

    componentDidMount(){
        const {instances} = this.props.organization;
        const memberInstances = this.memberInstances(instances);
        const memberInstancesWithoutAccess = this.getInstancesWithoutAccess(instances);
        this.setState({memberInstances, memberInstancesWithoutAccess, instances});
    }

    addAccessToInstance = async (instance) => {
        let {instances} = this.state;

        if (!instance) {
            return;
        }

        const acl = await this._instanceService.fetchCreateAcl(this.props.member, instance);
        let memberInstances = this.memberInstances(instances);

        //TODO when the API allow it fetch the instances of specific user rather than do it in local
        instances.find(i => i.id === instance.id).users.push(this.props.member);
        memberInstances.push(instance);
        const memberInstancesWithoutAccess = this.getInstancesWithoutAccess(instances);

        this.setState({memberInstances, instances, memberInstancesWithoutAccess});
        return acl;
    };

    removeAccessToInstance = async (e) => {
        let {instances} = this.state;
        const instanceId = e.currentTarget.dataset.instance;
        let instance = instances.find((instance) => {
            return instance.id === instanceId;
        });

        try {
            await this._instanceService.fetchDeleteAcl(this.props.member, instance);
            const errors = Object.assign({}, this.state.errors, {[instanceId]: ''});

            //TODO when the API allow it fetch the instances of specific user rather than do it in local
            let memberInstances = this.memberInstances(instances);
            memberInstances.splice(memberInstances.indexOf(instance.id),1);
            instance.users.splice(instance.users.indexOf(this.props.member.id),1);
            const memberInstancesWithoutAccess = this.getInstancesWithoutAccess(instances);

            this.setState({memberInstances, instances, memberInstancesWithoutAccess, errors});
        }catch(err){
            const errors = Object.assign({}, this.state.errors, {[instanceId]: err.error});
            this.setState({errors});
        }
    };

    removeMemberInOrganization = (memberId) => {
        return this.props.fetchDeleteMember(this.props.organization.id, memberId);
    };

    removeInvitationToJoinAnOrg = (member) => {
        return this.props.fetchRemoveOrganizationInvitation(this.props.organization.id, member);
    };

    memberInstances = (instances) => {
        const memberInstances = [];

        instances.forEach(instance => {
            if (!instance.users) {
                return;
            }

            const u = instance.users.find((user) => {
                return user.id === this.props.member.id;
            });

            if (u) {
                memberInstances.push(instance);
            }
        });
        return memberInstances;
    };

     getInstancesWithoutAccess = (instances) => {
         return instances.filter( instance => {
             if (!instance.users) {
                 return true;
             }

             return !instance.users.find((user) => {
                 return user.id === this.props.member.id;
             })
         });
    };

    onUpdateRoleMember = (isAdmin) => {
        return this.props.fetchUpdateRoleMember(this.props.organization.id, this.props.member.id, isAdmin);
    };

    handleDropDown = (dropDownState) => {
        if(dropDownState){
            //TODO fetch instances of the specific user, currently we need to fetch all the users of all the instances, then check in which instance is our user
        }
    };

    render() {
        const {memberInstances, memberInstancesWithoutAccess} = this.state;
        const member = this.props.member;
        const isPending = !member.name;
        const org = this.props.organization;

        const Header = <MemberDropdownHeader member={member}
                                             organization={org}
                                             onRemoveMemberInOrganization={this.removeMemberInOrganization}
                                             onUpdateRoleMember={this.onUpdateRoleMember}
                                             onRemoveInvitationToJoinAnOrg={this.removeInvitationToJoinAnOrg}/>;
        const dropDownicon = <i className="fa fa-list-alt option-icon"/>;
        return <DropDownMenu header={Header} dropDownIcon={dropDownicon} isAvailable={!isPending} dropDownChange={this.handleDropDown}>
            { org.admin &&
                <section className='dropdown-content'>
                    <ul className="list undecorated-list flex-col">
                        {
                            memberInstances.map((instance, i) => {
                                return <li key={instance.id}>
                                    <article className="item flex-row">
                                        <span className="name">{instance.name}</span>
                                        <span className="error-message">{this.state.errors[instance.id]}</span>
                                        <div className="options flex-row">
                                            <CustomTooltip title={this.context.t('tooltip.remove.instance')}>
                                                <button className="btn icon"
                                                        onClick={this.removeAccessToInstance} data-instance={instance.id}>
                                                    <i className="fa fa-trash option-icon delete"/>
                                                </button>
                                            </CustomTooltip>
                                        </div>
                                    </article>
                                </li>;
                            })
                        }
                    </ul>
                    <MemberDropdownFooter member={member}
                                          instances={memberInstancesWithoutAccess}
                                          onAddAccessToInstance={this.addAccessToInstance}/>
                </section>
            }
        </DropDownMenu>
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchDeleteMember(organizationId, memberId) {
            return dispatch(fetchDeleteMember(organizationId, memberId));
        },
        fetchUpdateRoleMember(organizationId, memberId, isAdmin) {
            return dispatch(fetchUpdateRoleMember(organizationId, memberId, isAdmin));
        },
        fetchRemoveOrganizationInvitation(orgId, invitation) {
            return dispatch(fetchRemoveOrganizationInvitation(orgId, invitation));
        }
    };
};

export default connect(null, mapDispatchToProps)(MemberDropdown);