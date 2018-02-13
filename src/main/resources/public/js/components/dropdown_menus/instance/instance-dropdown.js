import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Popup from 'react-popup';

//Components
import DropDownMenu from '../../dropdown-menu';
import InstanceInvitationForm from '../../forms/instance-invitation-form';
import InstanceDropdownHeader from './instance-dropdown-header';
import InstanceConfigForm from '../../forms/instance-config-form';

//action
import { fetchDeleteAcl } from '../../../actions/acl';
import { fetchCreateSubscription } from '../../../actions/subscription';
import { fetchUpdateInstanceStatus } from '../../../actions/instance';

//Config
import Config from '../../../config/config';
const instanceStatus = Config.instanceStatus;

//Action
import { fetchUpdateServiceConfig } from "../../../actions/instance";

class InstanceDropdown extends React.Component {

    static propTypes = {
        instance: PropTypes.object.isRequired,
        members: PropTypes.array.isRequired,
        isAdmin: PropTypes.bool
    };

    static defaultProps = {
        isAdmin: false
    };

    constructor(props){
        super(props);

        this.state = {
            error: null,
            status: {}
        };

        //bind methods
        this.onClickConfigIcon = this.onClickConfigIcon.bind(this);
        this.onRemoveInstance = this.onRemoveInstance.bind(this);
        this.onCancelRemoveInstance = this.onCancelRemoveInstance.bind(this);
        this.filterMemberWithoutAccess = this.filterMemberWithoutAccess.bind(this);
        this.removeUserAccessToInstance = this.removeUserAccessToInstance.bind(this);
        this.createSubscription = this.createSubscription.bind(this);
        this.fetchUpdateServiceConfig = this.fetchUpdateServiceConfig.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            instance: nextProps.instance,
            members: nextProps.members
        });
    }

    fetchUpdateServiceConfig(instanceId, catalogEntry) {
        return this.props.fetchUpdateServiceConfig(instanceId, catalogEntry)
            .then(() => {
                Popup.close();
            });
    }

    onClickConfigIcon(instance) {
        Popup.create({
            title: instance.name,
            content: <InstanceConfigForm instance={instance} onSubmit={this.fetchUpdateServiceConfig}/>
        }, true);
    }

    onRemoveInstance(instance) {
        this.props.fetchUpdateInstanceStatus(instance, instanceStatus.stopped);
    }

    onCancelRemoveInstance(instance) {
        this.props.fetchUpdateInstanceStatus(instance, instanceStatus.running);
    }

    filterMemberWithoutAccess(member) {
        if(!this.props.instance.users) {
            return true;
        }

        return !this.props.instance.users.find((user) => {
            return user.id === member.id;
        })
    }

    removeUserAccessToInstance(e) {
        const i = e.currentTarget.dataset.member;
        const member = this.props.instance.users[i];

        this.props.fetchDeleteAcl(member, this.props.instance)
            .then(() => {
                this.setState({
                    status: Object.assign({}, this.state.status, {
                        [member.id]: { error: null }
                    })
                });
            })
            .catch((err) => {
                this.setState({
                    status: Object.assign({}, this.state.status, {
                        [member.id]: { error: err.error }
                    })
                });
            });
    }

    createSubscription(e) {
        const el = e.currentTarget;
        const userId = el.dataset.user;
        const serviceId = el.dataset.service;

        fetchCreateSubscription(userId, serviceId)
            .then(() => {
                this.setState({
                    status: Object.assign({}, this.state.status, {
                        [userId]: { subIsSent: true, error: null }
                    })
                });
            })
            .catch((err) => {
                this.setState({
                    status: Object.assign({}, this.state.status, {
                        [userId]: { error: err.error }
                    })
                });
            });
    }

    render() {
        const isAdmin = this.props.isAdmin;
        const instance = this.props.instance;
        const isRunning = instance.applicationInstance.status === instanceStatus.running;
        const isAvailable = isAdmin && !instance.isPublic && isRunning;

        const membersWithoutAccess = this.props.members.filter(this.filterMemberWithoutAccess);
        const Header = <InstanceDropdownHeader
                            isAdmin={isAdmin}
                            instance={instance}
                            onClickConfigIcon={this.onClickConfigIcon}
                            onRemoveInstance={this.onRemoveInstance}
                            onCancelRemoveInstance={this.onCancelRemoveInstance}/>;
        const Footer = (isAvailable && <footer>
            <InstanceInvitationForm members={membersWithoutAccess} instance={instance}/>
        </footer>) || null;

        return <DropDownMenu header={Header} footer={Footer} isAvailable={isAvailable}>
            <section className='dropdown-content'>
                <table className="oz-table">
                    <thead>
                        {/*
                            Header: size: 3+ n (services)
                            user's name; error message; n services; options
                        */}
                        <tr>
                            <th className="fill-content" colSpan={2}/>
                            {
                                instance.services.map((service) => {
                                    return <th key={service.catalogEntry.id} className="center">
                                        <span className="service" title={service.name}>{service.name.toAcronyme()}</span>
                                    </th>
                                })
                            }
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            instance.users && instance.users.map((user, i) => {
                                const status = this.state.status[user.id];

                                return <tr key={user.id || user.email}>
                                    <td>
                                        <article className="item flex-row">
                                            <span className="name">{`${(user.id && user.name) || user.email}`}</span>
                                        </article>
                                    </td>

                                    {/* error messages */}
                                    <td className="fill-content">
                                        {
                                            status && status.error &&
                                            <span className="error">{status.error}</span>
                                        }
                                    </td>


                                    {/* Instances */}
                                    {
                                        user.id &&
                                        instance.services.map((service) => {
                                            return <td key={service.catalogEntry.id} className="center">
                                                {
                                                    (!status || !status.subIsSent) &&
                                                    <button className="btn icon" onClick={this.createSubscription}
                                                            data-user={user.id} data-service={service.catalogEntry.id}>
                                                        <i className="fa fa-home option-icon service"/>
                                                    </button>
                                                    || <i className="fa fa-check option-icon success"/>
                                                }
                                            </td>
                                        })
                                    }


                                    {/* Options */}
                                    {
                                        !user.id &&
                                        <td colSpan={instance.services.length + 1} className="right">
                                            <i className="fa fa-spinner fa-spin option-icon loading"/>
                                            <button className="btn icon" data-member={i}
                                                    onClick={this.removeUserAccessToInstance}>
                                                <i className="fa fa-trash option-icon delete"/>
                                            </button>
                                        </td>
                                    }

                                    {
                                        user.id &&
                                        <td colSpan={instance.services.length} className="right">
                                            <button className="btn icon" data-member={i}
                                                    onClick={this.removeUserAccessToInstance}>
                                                <i className="fa fa-trash option-icon delete"/>
                                            </button>
                                        </td>
                                    }
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </section>
        </DropDownMenu>;
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchDeleteAcl(user, instance) {
            return dispatch(fetchDeleteAcl(user, instance));
        },
        fetchUpdateInstanceStatus(instance, status) {
            return dispatch(fetchUpdateInstanceStatus(instance, status));
        },
        fetchUpdateServiceConfig(instanceId, catalogEntry) {
            return dispatch(fetchUpdateServiceConfig(instanceId, catalogEntry));
        }
    };
};

export default connect(null, mapDispatchToProps)(InstanceDropdown);
