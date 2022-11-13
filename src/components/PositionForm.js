import * as PositionType from '../enums/PositionType.js';

import Form, { DateInput, FormRow, NumberInput, TextInput } from "./Form.js";
import React, { useState } from "react";
import currencies, { getDefaultCurrency } from "../enums/currencies.js";
import { defaultDecimalSeparatorRegex, parseIntlFloat, prettyPrintIntlFloatString } from '../utils/formats.js';

import RecurrencePeriodicity from '../enums/RecurrencePeriodicity.js';
import { computeAmountChf } from '../utils/positions.js';
import t from '../utils/texts.js';
import { toYmd } from '../utils/dates.js';

function TypeDropdown({ classes, type, setPositionType }) {
    return (
        <div className="dropdown">
            <button className={`btn ${classes} btn-lg dropdown-toggle`} type="button" data-testid="type-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
                {PositionType.defs[type].text}
            </button>
            <ul className="dropdown-menu">
                {Object.values(PositionType.defs).map(d => <li key={d.id} data-testid={`option-${d.id}`} className="dropdown-item" onClick={() => setPositionType(d.id)}>{d.text}</li>)}
            </ul>
        </div>
    );
}

// FIXME implement/test delete functionality
// FIXME beim abspeichern muss die exchange rate überschrieben werden, falls es default currency ist, ebenso recurrence Felder
export default function PositionForm(props) {
    const [type, setType] = useState(props.position.type);
    const [amount, setAmount] = useState(prettyPrintIntlFloatString(props.position.amount, 2, defaultDecimalSeparatorRegex));
    const [currency, setCurrency] = useState(props.position.currency);
    const [exchangeRate, setExchangeRate] = useState(prettyPrintIntlFloatString(props.position.exchangeRate, 5, defaultDecimalSeparatorRegex));
    const [description, setDescription] = useState(props.position.description);
    const [isRecurring, setRecurring] = useState(props.position.recurring);
    const [recurrencePeriodicity, setRecurrencePeriodicity] = useState(props.position.recurrencePeriodicity || RecurrencePeriodicity.MONTHLY);
    // FIXME: from/to Felder befüllen

    const saveActionInternal = () => props.saveAction({
        type,
        amount,
        currency,
        exchangeRate,
        description
    });
    // FIXME re-implement proposals
    return (
        <Form
            id="position-form"
            abortAction={props.abortAction}
            saveAction={saveActionInternal}
            deleteAction={props.position._id ? () => console.log('Delete position', props.position._id) : null}
            title={classes => <TypeDropdown type={type} setPositionType={setType} classes={classes} />}>
            <FormRow>
                <div className="col-8 form-floating">
                    <NumberInput
                        id="amount"
                        label={t('Amount')}
                        value={amount}
                        setState={setAmount} />
                </div>
                <div className="col-4 form-floating">
                    <select id="currency-input" className="form-select" onChange={e => setCurrency(e.target.value)} defaultValue={currency} required>
                        {Object.values(currencies).map(c => <option key={c.id} value={c.id}>{c.isoCode}</option>)}
                    </select>
                    <label htmlFor="currency-input">{t('Currency')}</label>
                </div>
            </FormRow>
            {getDefaultCurrency().id !== currency ? <FormRow>
                <div className="input-group">
                    <label htmlFor="exchange-rate-input" className="input-group-text">{t('ExchangeRate')}</label>
                    <NumberInput
                        id="exchange-rate-input"
                        className="form-control text-end"
                        value={exchangeRate}
                        setState={setExchangeRate}
                        numFractionDigits={5} />
                    <span className="input-group-text" data-testid="chf-amount">
                        <span>{computeAmountChf(parseIntlFloat(amount), parseIntlFloat(exchangeRate))}</span>
                        <span>&nbsp;{getDefaultCurrency().displayName}</span>
                    </span>
                </div>
            </FormRow> : null}
            <FormRow>
                <TextInput
                    id="description"
                    classes="rounded-top"
                    label={`${PositionType.defs[type].benefactor}/${t('Description')}`}
                    value={description}
                    onChange={e => setDescription(e.target.value)} />
            </FormRow>
            <FormRow>
                <div className='col'>
                    <DateInput id="date-input" label={isRecurring ? t('Start') : t('Date')} value={props.position.recurring ? toYmd(props.position.recurrenceFrom) : toYmd(props.position.date)} />
                </div>
                {isRecurring ? <div className='col'>
                    <DateInput id="recurring-to-input" label={t('End')} value={toYmd(props.position.recurrenceTo)} />
                </div> : null}
            </FormRow>
            <FormRow classes="align-items-center">
                <div className="col col-auto">
                    <div className="form-check form-switch">
                        <input id="recurring-checkbox" className="form-check-input" type="checkbox" checked={isRecurring} onChange={e => setRecurring(e.target.checked)} />
                        <label htmlFor="recurring-checkbox" className="form-check-label">
                            <i className="bi bi-arrow-repeat" />
                            <span className="d-md-none d-xxl-inline">&nbsp;{t('Recurring')}</span>
                        </label>
                    </div>
                </div>
                <div className={`input-group col ${!isRecurring ? 'invisible' : ''}`}>
                    <input data-testid="recurrence-frequency" type="number" className="form-control text-end" size="2" maxLength="2" inputMode="numeric" defaultValue={props.position.recurrenceFrequency || '1'} />

                    <input
                        name="recurring-periodicity"
                        id="recurring-monthly"
                        className="btn-check"
                        type="radio"
                        checked={recurrencePeriodicity === RecurrencePeriodicity.MONTHLY}
                        onChange={() => setRecurrencePeriodicity(RecurrencePeriodicity.MONTHLY)} />
                    <label htmlFor="recurring-monthly" className="btn btn-outline-primary">{t('Monthly')}</label>

                    <input
                        name="recurring-periodicity"
                        id="recurring-yearly"
                        className="btn-check"
                        type="radio"
                        checked={recurrencePeriodicity === RecurrencePeriodicity.YEARLY}
                        onChange={() => setRecurrencePeriodicity(RecurrencePeriodicity.YEARLY)} />
                    <label htmlFor="recurring-yearly" className="btn btn-outline-primary">{t('Yearly')}</label>
                </div>
            </FormRow>
        </Form>
    );
}
