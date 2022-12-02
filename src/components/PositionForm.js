import * as PositionType from '../enums/PositionType.js';

import Form, { DateInput, FormRow, NumberInput, TextInput } from "./Form.js";
import React, { useState } from "react";
import currencies, { getDefaultCurrency } from "../enums/currencies.js";
import { localToFloatString, parseIntlFloat, prettyPrintFloatString } from '../utils/formats.js';

import NumberFormats from '../enums/NumberFormats.js';
import RecurrencePeriodicity from '../enums/RecurrencePeriodicity.js';
import { computeAmountChf } from '../utils/positions.js';
import t from '../utils/texts.js';
import { toYmd } from '../utils/dates.js';
import { v4 } from 'uuid';

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

// FIXME beim abspeichern muss die exchange rate überschrieben werden, falls es default currency ist, ebenso recurrence Felder
export default function PositionForm({ position, saveAction, abortAction, deleteAction }) {
    const [type, setType] = useState(position.type);
    const [amount, setAmount] = useState(prettyPrintFloatString(position.amount, 2, NumberFormats.DEFAULT));
    const [currency, setCurrency] = useState(position.currency);
    const [exchangeRate, setExchangeRate] = useState(prettyPrintFloatString(position.exchangeRate, 5, NumberFormats.DEFAULT));
    const [description, setDescription] = useState(position.description);
    const [startDate, setStartDate] = useState(position.recurring ? toYmd(position.recurrenceFrom) : toYmd(position.date));
    const [endDate, setEndDate] = useState(toYmd(position.recurrenceTo));
    const [isRecurring, setRecurring] = useState(position.recurring);
    const [recurrencePeriodicity, setRecurrencePeriodicity] = useState(position.recurrencePeriodicity || RecurrencePeriodicity.MONTHLY);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState(position.recurrenceFrequency || '1');

    const [amountValidated, setAmountValidated] = useState(false);
    const [exchangeRateValidated, setExchangeRateValidated] = useState(false);
    const [descriptionValidated, setDescriptionValidated] = useState(false);
    const [frequencyValidated, setFrequencyValidated] = useState(false);

    const saveActionInternal = () => saveAction({
        ...position,
        _id: position._id || v4(),
        type,
        amount: localToFloatString(amount),
        currency,
        exchangeRate: localToFloatString(exchangeRate),
        description,
        date: isRecurring ? null : new Date(startDate),
        recurring: isRecurring,
        recurrencePeriodicity: isRecurring ? recurrencePeriodicity : null,
        recurrenceFrequency: isRecurring ? Number(recurrenceFrequency) : null,
        recurrenceFrom: isRecurring ? new Date(startDate) : null,
        recurrenceTo: isRecurring ? new Date(endDate) : null
    });

    const descriptionLabel = `${PositionType.defs[type].benefactor}/${t('Description')}`;

    // TODO NL-Übersetzungen für Validierungs-Messages
    return (
        <Form
            abortAction={abortAction}
            saveAction={saveActionInternal}
            deleteAction={() => deleteAction(position._id)}
            title={classes => <TypeDropdown type={type} setPositionType={setType} classes={classes} />}>
            <FormRow>
                <div className={`col-8 form-floating ${amountValidated ? 'was-validated' : 'needs-validation'}`}>
                    <NumberInput
                        id="amount"
                        value={amount}
                        placeholder={t('Amount')}
                        setState={a => {
                            setAmount(a);
                            setAmountValidated(true);
                        }}
                        required />
                    <label htmlFor="amount">{t('Amount')}</label>
                    <div className="invalid-feedback">
                        {amount ? t('XIsNotANumber', amount) : t('PleaseProvideAnAmount')}
                    </div>
                </div>
                <div className="col-4 form-floating">
                    <select id="currency-input" className="form-select" onChange={e => setCurrency(e.target.value)} defaultValue={currency} required>
                        {Object.values(currencies).map(c => <option key={c.id} value={c.id}>{c.isoCode}</option>)}
                    </select>
                    <label htmlFor="currency-input">{t('Currency')}</label>
                </div>
            </FormRow>
            {getDefaultCurrency().id !== currency ? <FormRow>
                <div className={`input-group has-validation ${exchangeRateValidated ? 'was-validated' : 'needs-validation'}`}>
                    <label htmlFor="exchange-rate-input" className="input-group-text">{t('ExchangeRate')}</label>
                    <NumberInput
                        id="exchange-rate-input"
                        className="form-control text-end"
                        value={exchangeRate}
                        setState={er => {
                            setExchangeRate(er);
                            setExchangeRateValidated(true);
                        }}
                        numFractionDigits={5}
                        required />
                    <span className="input-group-text" data-testid="chf-amount">
                        <span>{computeAmountChf(parseIntlFloat(amount), parseIntlFloat(exchangeRate))}</span>
                        <span>&nbsp;{getDefaultCurrency().displayName}</span>
                    </span>
                    <div className="invalid-feedback">
                        {exchangeRate ? t('XIsNotANumber', exchangeRate) : t('PleaseProvideAnExchangeRate')}
                    </div>
                </div>
            </FormRow> : null}
            <FormRow>
                <div className={`form-floating ${descriptionValidated ? 'was-validated' : 'needs-validation'}`}>
                    <TextInput
                        id="description"
                        classes="rounded-top"
                        placeholder={descriptionLabel}
                        value={description}
                        onChange={e => {
                            setDescription(e.target.value);
                            setDescriptionValidated(true);
                        }}
                        required />
                    <label htmlFor="description">{descriptionLabel}</label>
                    <div className='invalid-feedback'>
                        {t('PleaseProvideADescription')}
                    </div>
                </div>
            </FormRow>
            <FormRow>
                <div className="col">
                    <DateInput
                        id="date-input"
                        label={isRecurring ? t('Start') : t('Date')}
                        value={startDate}
                        setState={setStartDate}
                        required />
                </div>
                {isRecurring ? <div className='col'>
                    <DateInput
                        id="recurring-to-input"
                        label={t('End')}
                        value={endDate}
                        setState={setEndDate} />
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
                <div className={`input-group col has-validation position-relative ${!isRecurring ? 'invisible' : ''} ${isRecurring && frequencyValidated ? 'was-validated' : 'needs-validation'}`}>
                    <input
                        data-testid="recurrence-frequency"
                        type="number"
                        className="form-control text-end"
                        size="2"
                        maxLength="2"
                        inputMode="numeric"
                        value={recurrenceFrequency}
                        onChange={e => {
                            setRecurrenceFrequency(e.target.value);
                            setFrequencyValidated(true);
                        }}
                        required={isRecurring} />

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

                    <div className='invalid-tooltip'>
                        {t('PleaseProvideAFrequency')}
                    </div>
                </div>
            </FormRow>
        </Form>
    );
}
