import * as PositionType from '../enums/PositionType.js';

import React, { useState } from "react";

import Form from "./Form.js";
import currencies from "../enums/currencies.js";
import t from '../utils/texts.js';

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
// FIXME move type selection to title
// FIXME re-add delete button if exists
export default function PositionForm(props) {
    const [positionType, setPositionType] = useState(props.position.type);
    return (
        <Form
            abortAction={props.abortAction}
            saveAction={props.saveAction}
            title={classes => <TypeDropdown type={positionType} setPositionType={setPositionType} classes={classes} />}>
            <div className="row g-2">
                <div className="col-8 form-floating">
                    <input className="form-control text-end" placeholder={t('Amount')} inputMode="numeric" defaultValue={props.position.amount} />
                    <label htmlFor="amount">{t('Amount')}</label>
                </div>
                <div className="col-4 form-floating">
                    <select className="form-select" defaultValue={props.position.currency} required>
                        {Object.values(currencies).map(c => <option key={c.id} value={c.id}>{c.isoCode}</option>)}
                    </select>
                    <label htmlFor="currency-input">{t('Currency')}</label>
                </div>
            </div>
        </Form>
    );
}
