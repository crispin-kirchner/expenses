import React from "react";
import t from "../utils/texts";

export default function Form(props) {
    return (
        <form className="container" id="expense-form" autoComplete="off" onSubmit={props.saveAction} noValidate>
            <div className="d-flex align-items-baseline mb-2">
                <div className="me-auto">
                    {props.title}
                </div>
                <button className="btn-close" type="button" aria-label="Close" onClick={props.abortAction} />
            </div>
            {props.children}
            <div className="d-flex flex-row-reverse mt-2">
                <button className="btn btn-primary ms-2" type="submit" title={t('Save')}>
                    <i className="bi-check-circle"></i>
                    &nbsp;{t('Save')}
                </button>
                <button id="delete-button" className="btn btn-outline-danger" type="button" title="${t('Delete')}">
                    <i className="bi-trash"></i>
                    &nbsp;{t('Delete')}
                </button>
            </div>
        </form>
    );
}
