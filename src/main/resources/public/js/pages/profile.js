'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import renderIf from 'render-if';
import moment from 'moment';
import Select from 'react-select';

import '../util/csrf';

// Component
import FranceConnectBtn from '../components/france-connect-btn';
import { Form, InputText, SubmitButton, InputDatePicker, CountrySelector, GenderSelector } from '../components/forms/form';
import GeoAreaAutosuggest from '../components/autosuggests/geoarea-autosuggest';

class Profile extends React.Component {
    state = {
        userProfile: {
            nickname: '',
            email_address: '',
            locale: '',
            given_name: '',
            middle_name: '',
            family_name: '',
            phone_number: '',
            gender: ''
        },
        genders: [],
        languages: [],
        passwordChangeEndpoint: '',
        unlinkFranceConnectEndpoint: '',
        linkFranceConnectEndpoint: ''
    };

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    componentDidMount() {
        $.ajax({
            url: '/my/api/profile'
        }).done(data => {
            this.setState(data);
        })
        .fail((xhr, status, err) => {
            this.setState({ error : "Unable to retrieve profile info" })
        })

    }
    onValueChange(field, value) {
        const fields = this.state.userProfile
        if (field.indexOf('.') === -1) {
            fields[field] = value
        } else {
            const splittedField = field.split('.')

            let parentObject = undefined
            if (fields[splittedField[0]] === undefined) {
                parentObject = {}
                fields[splittedField[0]] = parentObject
            } else {
                parentObject = fields[splittedField[0]]
            }
            parentObject[splittedField[1]] = value
        }
        this.setState({ userProfile: fields })
    }
    onSubmit(e) {
        e.preventDefault()

        $.ajax({
            url: '/my/api/profile',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(this.state.userProfile)
        })
            .done(function (data) {
                this.setState({ updateSucceeded: true })
                this.componentDidMount()
            }.bind(this))
    }
    render() {
        const userProfile = this.state.userProfile;
        return (
            <div className="container" id="profile">
                <Form id="account" onSubmit={this.onSubmit.bind(this)}>
                    {renderIf(this.state.updateSucceeded) (
                        <div className="alert alert-success" role="alert">
                            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            {this.context.t('my.profile.account.update')}
                        </div>
                    )}
                    <ProfileAccount userProfile={userProfile} languages={this.state.languages}
                                    onValueChange={this.onValueChange.bind(this)} />
                    <IdentityAccount userProfile={userProfile}
                                     onValueChange={this.onValueChange.bind(this)} />
                    <AddressAccount address={userProfile.address}
                                    onValueChange={this.onValueChange.bind(this)} />
                    <SubmitButton label={this.context.t('ui.save')} className="btn-lg" />
                </Form>

                <PasswordAccount passwordChangeEndpoint={this.state.passwordChangeEndpoint} passwordExist={!!userProfile.email_verified} />
                <FranceConnectBtn passwordChangeEndpoint={this.state.passwordChangeEndpoint}
                                  linkFranceConnectEndpoint={this.state.linkFranceConnectEndpoint}
                                  unlinkFranceConnectEndpoint={this.state.unlinkFranceConnectEndpoint}
                                  userProfile={userProfile}/>
            </div>
        )
    }
}

class ProfileAccount extends React.Component {
    static propTypes = {
        userProfile: PropTypes.object.isRequired,
        languages: PropTypes.array.isRequired,
        onValueChange: PropTypes.func.isRequired,
    };

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            options: this.createOptions(this.props.languages)
        };

        this.createOptions = this.createOptions.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ options: this.createOptions(nextProps.languages) });
    }

    createOptions(languages) {
        const options = [];
        languages.forEach((lang) => {
            const label = this.context.t(`my.profile.account.language.${lang}`);
            options.push({ value: lang, label })
        });

        return options;
    }

    handleSelectChange(valueSelected) {
        this.props.onValueChange('locale', valueSelected.value);
    }

    render() {
        return (
            <fieldset className="oz-fieldset">
                <legend className="oz-legend">{this.context.t('my.profile.title.account')}</legend>
                <div className="flex-row">
                    <label className="label">
                        {this.context.t('my.profile.account.email')} *
                    </label>
                    <span className="field">{this.props.userProfile.email_address}</span>
                </div>

                <InputText name="nickname" value={this.props.userProfile.nickname} isRequired={true}
                           onChange={e => this.props.onValueChange('nickname', e.target.value)}
                           label={this.context.t('my.profile.personal.nickname')} />

                {/*<LanguageSelector value={this.props.userProfile.locale} languages={this.props.languages}
                                  onChange={e => this.props.onValueChange('locale', e.target.value)}/>*/}
                <div className="flex-row">
                    <label htmlFor="language" className="label">{this.context.t('my.profile.account.language')} *</label>
                    <Select className="select field" value={this.props.userProfile.locale}
                            onChange={this.handleSelectChange} placeholder=""
                            options={this.state.options} clearable={false} required={true} />
                </div>
            </fieldset>
        )
    }
}

class IdentityAccount extends React.Component {
    static propTypes = {
        userProfile: PropTypes.object.isRequired,
        onValueChange: PropTypes.func.isRequired,
    };

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    handleChange(date) {
        let birthdate = date;
        /*if (!date.isUTC()) {
            birthdate = moment(date).utc().add(date.utcOffset(), 'm');
        }*/

        this.props.onValueChange('birthdate', birthdate);
    }

    render () {
        moment.locale(this.props.userProfile.locale)
        const birthdate = moment.utc(this.props.userProfile.birthdate);

        return (
            <fieldset className="oz-fieldset">
                <legend className="oz-legend">{this.context.t('my.profile.personal.identity')}</legend>
                <InputText name="given_name" value={this.props.userProfile.given_name}
                           onChange={e => this.props.onValueChange('given_name', e.target.value)}
                           label={this.context.t('my.profile.personal.firstname')} />
                <InputText name="middle_name" value={this.props.userProfile.middle_name}
                           label={this.context.t('my.profile.personal.middlename')}
                           onChange={e => this.props.onValueChange('middle_name', e.target.value)} />
                <InputText name="family_name" value={this.props.userProfile.family_name}
                           label={this.context.t('my.profile.personal.lastname')}
                           onChange={e => this.props.onValueChange('family_name', e.target.value)} />
                <InputDatePicker name="birthdate" label={this.context.t('my.profile.personal.birthdate')}
                                 onChange={this.handleChange.bind(this)} onSubmit={this.handleChange.bind(this)}
                                 value={birthdate} dropdownMode="select"/>
                <InputText name="phone_number" value={this.props.userProfile.phone_number}
                           label={this.context.t('my.profile.personal.phonenumber')}
                           onChange={e => this.props.onValueChange('phone_number', e.target.value)} />
                <GenderSelector value={this.props.userProfile.gender}
                                onChange={value => this.props.onValueChange('gender', value)} />
            </fieldset>
        )
    }
}

class AddressAccount extends React.Component {
    static propTypes = {
        address: PropTypes.object,
        onValueChange: PropTypes.func.isRequired,
    };
    static defaultProps = {
        address: {}
    };

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        //bind methods
        this.handleChange = this.handleChange.bind(this);
        this.onGeoAreaSelected = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onValueChange('address.locality', e.currentTarget.value);
    }

    onGeoAreaSelected(locality) {
        this.props.onValueChange('address.locality', locality.name);
        this.props.onValueChange('address.postal_code', locality.postalCode);
    }

    render () {
        return (
            <fieldset className="oz-fieldset">
                <legend className="oz-legend">{this.context.t('my.profile.personal.address')}</legend>
                <CountrySelector value={this.props.address.country}
                                 onChange={value => this.props.onValueChange('address.country', value)}
                                 url="/api/store/dc-countries"/>
                <div className="flex-row">
                    <label className="label">
                        {this.context.t('my.profile.personal.locality')}
                    </label>
                    <GeoAreaAutosuggest name="locality"
                                        onGeoAreaSelected={this.onGeoAreaSelected}
                                        onChange={this.handleChange}
                                        countryUri={this.props.address.country || ''}
                                        endpoint="/dc-cities" placeholder={this.context.t('my.profile.personal.locality')}
                                        value={this.props.address.locality} />
                </div>

                <InputText name="address.postal_code" value={this.props.address.postal_code}
                           label={this.context.t('my.profile.personal.postalcode')}
                           onChange={e => this.props.onValueChange('address.postal_code', e.target.value)}
                           disabled={true} />

                <InputText name="address.street_address" value={this.props.address.street_address}
                           label={this.context.t('my.profile.personal.streetaddress')}
                           onChange={e => this.props.onValueChange('address.street_address', e.target.value)} />
            </fieldset>
        )
    }
}

class PasswordAccount extends React.Component {
    static propTypes = {
        passwordChangeEndpoint: PropTypes.string.isRequired,
        passwordExist: PropTypes.bool
    };

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return (
            <div className="flex-col">
                <h2>{this.context.t('my.profile.account.password')}</h2>

                <a className="change-password" href={this.props.passwordChangeEndpoint}>
                    <span className="btn btn-lg btn-warning">
                        { this.props.passwordExist && this.context.t('my.profile.account.changepassword')}
                        { !this.props.passwordExist && this.context.t('my.profile.account.createpassword')}
                    </span>
                </a>
            </div>
        )
    }
}

class ProfileWrapper extends React.Component {

    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return <div className="oz-body page-row page-row-expanded">

            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <h1 className="text-center">
                            <span className="title" >{this.context.t('my.profile')}</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="oz-body-content">
                <Profile/>
            </div>

            <div className="push"></div>
        </div>;
    }
}

export default ProfileWrapper;
