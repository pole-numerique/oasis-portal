import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

//Components
import AddInstanceDropdown from '../dropdown_menus/instance/add-instance-dropdown';
import InstanceDropdown from '../dropdown_menus/instance/instance-dropdown';

class InstancesTabHeader extends React.Component {

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return <Link className="undecorated-link" to={`/my/organization/${this.props.organization.id}/instances`}>
            <header className="tab-header">
                <span>{this.context.t('organization.desc.applications')}</span>
            </header>
        </Link>;
    }
}

const InstancesTabHeaderWithRedux = connect(state => {
    return {
        organization: state.organization.current
    };
})(InstancesTabHeader);


class InstancesTab extends React.Component {

    static contextTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const org = this.props.organization;

        return <article className="instances-tab">

            {
                org.admin &&
                <section className="add-instance">
                    <AddInstanceDropdown/>
                </section>
            }


            <section>
                <ul className="instances-list undecorated-list flex-col">
                    {
                        org.instances.map(instance => {
                            return <li key={instance.id} className="instance">
                                <InstanceDropdown instance={instance} members={org.members || []} isAdmin={org.admin}/>
                            </li>
                        })
                    }
                </ul>
            </section>

        </article>;
    }
}

const mapStateToProps = state => {
    return {
        organization: state.organization.current,
    };
};

const InstanceTabWithRedux = connect(mapStateToProps)(InstancesTab);


export {
    InstanceTabWithRedux as InstancesTab,
    InstancesTabHeaderWithRedux as InstancesTabHeader
};