import React, {Component} from 'react'
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import Config from '../../config/config';
import customFetch, { urlBuilder } from "../../util/custom-fetch";

const sizeQueryBeforeFetch = Config.sizeQueryBeforeFetch;

const renderSuggestion = suggestion => (
    <div>
        <p className="main-info">{suggestion.name}</p>
    </div>
);

class GeoAreaAutosuggest extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        endpoint: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        value: PropTypes.string,
        countryUri: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        onGeoAreaSelected: PropTypes.func,
        onBlur: PropTypes.func,
        required: PropTypes.bool
    };

    static defaultProps = {
        value: '',
        placeholder: '',
        required: false
    };

    state = {
        suggestions: []
    };

    searchCities(query) {
        customFetch(urlBuilder(`/api/geo/${this.props.endpoint}`, {country_uri: this.props.countryUri, q: query}))
            .then((res) => this.setState({ suggestions: res.areas }));
    }

    onSuggestionsFetchRequested = ({value}) => {
        this.searchCities(value);
    };

    onSuggestionsClearRequested = () => {
        this.setState({suggestions: []})
    };

    onSuggestionSelected = (event, {suggestion}) => {
        this.props.onGeoAreaSelected(event, suggestion);
    };

    getSuggestionValue = suggestion => {
        return suggestion.name || GeoAreaAutosuggest.defaultProps.value;
    };

    shouldRenderSuggestions = (input) => {
        return input && (input.trim().length >= sizeQueryBeforeFetch);
    };

    handleOnChange = (event, {newValue}) => {
        this.props.onChange(event, newValue);
    };

    render() {
        const inputProps = {
            name: this.props.name,
            value: this.props.value || GeoAreaAutosuggest.defaultProps.value,
            onChange: this.handleOnChange,
            onBlur: this.props.onBlur,
            type: 'search',
            placeholder: this.props.placeholder || GeoAreaAutosuggest.defaultProps.placeholder,
            className: `form-control ${this.props.className}`,
            required: this.props.required
        };


        return <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            onSuggestionSelected={this.onSuggestionSelected}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            shouldRenderSuggestions={this.shouldRenderSuggestions}/>
    }
}

export default GeoAreaAutosuggest;
