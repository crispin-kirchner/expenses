import Form from "./Form.js";
import React from "react";
import currencies from "../enums/currencies.js";
import t from '../utils/texts.js';

// FIXME load existing position functionality
// FIXME move type selection to title
// FIXME re-add delete button
export default function PositionForm(props) {
    return (
        <Form
            abortAction={props.abortAction}
            saveAction={props.saveAction}
            title={<h4 className="lh-1 mb-0">Ausgabe</h4>}>
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
