import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {SelectFieldPopup} from './SelectFieldPopup';
import {differenceBy, get} from 'lodash';

import {LineInput, Label} from '../';
import {TermsList} from '../../';

import './style.scss';

export class SelectMetaTermsInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            multiLevel: false,
            openSelectPopup: false,
        };

        this.removeValue = this.removeValue.bind(this);
        this.toggleOpenSelectPopup = this.toggleOpenSelectPopup.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        // There is at least one parent or multi-level option
        this.setState({multiLevel: this.props.options.filter((o) => (o.parent)).length > 0});
    }

    toggleOpenSelectPopup() {
        this.setState({openSelectPopup: !this.state.openSelectPopup});
    }

    removeValue(index) {
        const {value, field, onChange} = this.props;

        value.splice(index, 1);
        onChange(field, value);
    }

    removeValuesFromOptions() {
        if (!this.state.multiLevel) {
            return differenceBy(this.props.options, this.props.value, this.props.valueKey);
        } else {
            return this.props.options;
        }
    }

    onChange(opt) {
        const {value, valueKey, onChange, field} = this.props;

        // Check if it's duplicate
        if (value && value.length > 0) {
            if (value.find((v) => (v[valueKey] === opt[valueKey]))) {
                return;
            }

            onChange(field, [...value, opt]);
        } else {
            onChange(field, [opt]);
        }
    }

    render() {
        const {value, label, labelKey, ...props} = this.props;
        const options = this.removeValuesFromOptions();

        return (
            <LineInput
                {...props}
                withButton={true}
                className="select__meta-terms"
            >
                <span
                    className={classNames(
                        'sd-line-input__plus-btn',
                        {'sd-line-input__plus-btn--disabled': options.length === 0}
                    )}
                    onClick={options.length > 0 ? this.toggleOpenSelectPopup : null}
                />

                <Label text={label} />

                <div className="sd-line-input__input">
                    {get(value, 'length', 0) > 0 && (
                        <TermsList
                            terms={value}
                            displayField={labelKey}
                            onClick={this.removeValue}
                        />
                    )}
                </div>

                { this.state.openSelectPopup &&
                    <SelectFieldPopup
                        value={value}
                        multiLevel={this.state.multiLevel}
                        options={options}
                        onCancel={this.toggleOpenSelectPopup}
                        target="sd-line-input__plus-btn"
                        onChange={(opt) => {
                            this.onChange(opt);
                            this.toggleOpenSelectPopup();
                        }}
                    />
                }
            </LineInput>
        );
    }
}

SelectMetaTermsInput.propTypes = {
    options: PropTypes.array.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape(undefined),
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.object,
        }),
    ]),
    label: PropTypes.string,
    labelKey: PropTypes.string,
    valueKey: PropTypes.string,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    field: PropTypes.string.isRequired,
};

SelectMetaTermsInput.defaultProps = {
    required: false,
    labelKey: 'name',
    valueKey: 'qcode',
};
