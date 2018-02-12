import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";

class Header extends React.Component {

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return <header className="oz-header flex-row">
            <div className="logo-home">
                <Link to='/my/dashboard'>
                    <img src="/img/logo-ozwillo.png" alt="Logo Ozwillo"/>
                </Link>
            </div>

            <div className="my-oasis">
                <p className="text-center welcome" data-toggle="tooltip" data-placement="bottom"
                   title={ this.props.message }>
                    <Link to="/my/notif">
                        <span>{this.context.t('ui.welcome')} {this.props.userInfo.nickname} </span>
                        <span className="badge badge-notifications">
                            { this.props.notificationsCount }
                            <span className="sr-only">{ this.props.message }</span>
                        </span>
                    </Link>
                </p>
            </div>
        </header>
    }

}

const mapStateToProps = (state) => {
    return {
        notificationsCount: state.notifications.count,
        message: state.notifications.message,
        userInfo: state.userInfo
    }
}

export default connect(mapStateToProps)(Header);