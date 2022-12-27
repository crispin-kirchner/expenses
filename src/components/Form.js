import Navbar, { LinkButton } from "./Navbar";
import React, { useState } from "react";

import NumberFormats from "../enums/NumberFormats";
import { numberRegex } from '../utils/formats.js';
import { prettyPrintFloatString } from "../utils/formats";
import t from "../utils/texts";

// TODO Form sieht doof aus auf desktop und submitted nicht auf mobile --> überarbeiten
function FormButton({ classes, type, label, onClick, icon, showLabel, form }) {
    return <button
        className={`btn ${classes}`}
        form={form}
        type={type}
        title={label}
        onClick={onClick}>
        <i className={`bi ${icon}`}></i>
        <span className={showLabel ? '' : 'd-md-none'}>&nbsp;{label}</span>
    </button>;
}

function Title({ formId, closeButton, content, classes, deleteAction }) {
    return (<>
        {closeButton}
        <div className="me-auto">
            {content(classes)}
        </div>
        {
            deleteAction ?
                <FormButton classes="btn-outline-danger" icon="bi-trash" type="button" label={t('Delete')} onClick={deleteAction} /> : null
        }
        <FormButton classes="btn-primary ms-2" type="submit" form={formId} icon="bi-check-circle" label={t('Save')} showLabel={!deleteAction} />
    </>);
}

export function FormRow({ classes, children }) {
    return <div className={`row g-2 mb-3 ${classes ? classes : ''}`}>{children}</div>;
}

export function TextInput({ id, classes, placeholder, value, attrs, onChange, onBlur, pattern, required }) {
    const attributes = {
        className: `form-control ${classes}`,
        id,
        placeholder: placeholder,
        pattern,
        value,
        onBlur,
        onChange,
        required,
        ...attrs
    };
    return React.createElement('input', attributes);
}

export function NumberInput({ id, placeholder, value, setState, numFractionDigits, required }) {
    numFractionDigits = numFractionDigits || 2;
    let pattern = numberRegex[NumberFormats.LOCAL].toString();
    pattern = pattern.substring(1, pattern.length - 1);
    return (
        <TextInput
            classes="text-end"
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={e => setState(e.target.value)}
            onBlur={e => {
                setState(prettyPrintFloatString(e.target.value, numFractionDigits));
            }}
            pattern={pattern}
            required={required}
            attrs={{
                inputMode: "numeric"
            }} />
    );
}

export function DateInput({ id, label, value, setState, required }) {
    return <TextInput
        id={id}
        label={label}
        value={value}
        onChange={e => setState(e.target.value)}
        attrs={{ type: 'date' }}
        required={required} />
}

export default function Form({ id, title, abortAction, deleteAction, saveAction, children }) {
    const [wasValidated, setWasValidated] = useState(false);
    return (<>
        <div className="d-md-none mb-3">
            <Navbar>
                <div className="w-100 d-flex align-items-center">
                    <Title
                        formId={id}
                        content={title}
                        abortAction={abortAction}
                        deleteAction={deleteAction}
                        classes="btn-dark"
                        closeButton={<LinkButton onClick={abortAction} icon="bi-x-lg"></LinkButton>} />
                </div>
            </Navbar>
        </div>
        <form
            id={id}
            className={`container ${wasValidated ? 'was-validated' : 'needs-validation'}`}
            autoComplete="off"
            onSubmit={event => {
                event.preventDefault();
                setWasValidated(true);
                if (!event.target.checkValidity()) {
                    return;
                }
                saveAction();
                setWasValidated(false);
            }}
            noValidate>
            <div className="align-items-center mt-2 mb-3 d-none d-md-flex">
                <Title
                    formId={id}
                    content={title}
                    deleteAction={deleteAction}
                    classes="btn-outline-dark"
                    closeButton={<button type="button" className="btn-close me-2" onClick={abortAction} />} />
            </div>
            {children}
        </form>
    </>);
}
