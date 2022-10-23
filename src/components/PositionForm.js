import * as PositionType from '../enums/PositionType.js';

import Form, { DateInput, FormRow, NumberInput, TextInput } from "./Form.js";
import React, { useState } from "react";
import currencies, { getDefaultCurrency } from "../enums/currencies.js";

import { computeAmountChf } from '../utils/positions.js';
import t from '../utils/texts.js';
import { toYmd } from '../utils/dates.js';

function TypeDropdown(props) {
    return <div className="dropdown">
        <button className={`btn ${props.classes} btn-lg dropdown-toggle`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {PositionType.defs[props.type].text}
        </button>
        <ul className="dropdown-menu">
            {Object.values(PositionType.defs).map(d => <li key={d.id} className="dropdown-item" onClick={() => props.setPositionType(d.id)}>{d.text}</li>)}
        </ul>
    </div>;
}

// FIXME load existing position functionality
// FIXME implement/test delete functionality
// FIXME beim abspeichern muss die exchange rate überschrieben werden, falls es default currency ist
// FIXME machen dass die Welt nicht explodiert wenn isRecurring = true gesetzt wird oder wenn eine Position ohne Enddatum gesetzt wird
export default function PositionForm(props) {
    const [positionType, setPositionType] = useState(props.position.type);
    const [currencyId, setCurrencyId] = useState(props.position.currency);
    const [exchangeRate, setExchangeRate] = useState(props.position.exchangeRate);
    const [amount, setAmount] = useState(props.position.amount);
    const [isRecurring, setRecurring] = useState(props.position.recurring);
    // FIXME re-implement proposals
    return (
        <Form
            abortAction={props.abortAction}
            saveAction={props.saveAction}
            deleteAction={props.position._id ? () => console.log('Delete position', props.position._id) : null}
            title={classes => <TypeDropdown type={positionType} setPositionType={setPositionType} classes={classes} />}>
            <FormRow>
                <div className="col-8 form-floating">
                    <NumberInput id="amount" label={t('Amount')} defaultValue={amount} onChange={val => setAmount(val)} />
                </div>
                <div className="col-4 form-floating">
                    <select className="form-select" onChange={e => setCurrencyId(e.target.value)} defaultValue={props.position.currency} required>
                        {Object.values(currencies).map(c => <option key={c.id} value={c.id}>{c.isoCode}</option>)}
                    </select>
                    <label htmlFor="currency-input">{t('Currency')}</label>
                </div>
            </FormRow>
            {getDefaultCurrency().id !== currencyId ? <FormRow>
                <div className="input-group">
                    <span className="input-group-text">{t('ExchangeRate')}</span>
                    <NumberInput className="form-control text-end" defaultValue={exchangeRate} onChange={setExchangeRate} numFractionDigits={5} />
                    <span className="input-group-text">
                        <span>{computeAmountChf(amount, exchangeRate)}</span>
                        <span>&nbsp;{getDefaultCurrency().displayName}</span>
                    </span>
                </div>
            </FormRow> : null}
            <FormRow>
                <TextInput
                    id="description"
                    classes="rounded-top"
                    label={`${PositionType.defs[positionType].benefactor}/${t('Description')}`} defaultValue={props.position.description} />
            </FormRow>
            <FormRow>
                <div className='col'>
                    <DateInput id="date-input" label={isRecurring ? t('Start') : t('Date')} defaultValue={props.position.recurring ? toYmd(props.position.recurrenceFrom) : toYmd(props.position.date)} />
                </div>
                {isRecurring ? <div className='col'>
                    <DateInput id="recurring-to-input" label={t('End')} defaultValue={toYmd(props.position.recurrenceTo)} />
                </div> : null}
            </FormRow>
            <FormRow>
                <div className="col col-auto">
                    <div className="form-check form-switch">
                        <input id="recurring-checkbox" className="form-check-input" type="checkbox" checked={isRecurring} onChange={e => setRecurring(e.target.checked)} />
                        <label htmlFor="recurring-checkbox" class="form-check-label">{t('Recurring')}</label>
                    </div>
                </div>
            </FormRow>
        </Form>
    );
}
