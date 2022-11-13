import Navbar, { LinkButton } from "./Navbar";

import React from "react";
import { prettyPrintFloatString } from "../utils/formats";
import t from "../utils/texts";

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

export function FormRow(props) {
    return <div className={`row g-2 mb-3 ${props.classes}`}>{props.children}</div>;
}

export function TextInput({ id, classes, label, value, attrs, onChange, onInput, onBlur }) {
    if (label && !id) {
        // FIXME throw something different
        throw 'Input with a label needs an id';
    }
    const attributes = {
        className: `form-control ${classes}`,
        id,
        placeholder: label,
        value,
        onInput,
        onBlur,
        onChange,
        ...attrs
    };
    const inputElement = React.createElement('input', attributes);
    if (!label) {
        return inputElement;
    }
    return <div className="form-floating">
        {inputElement}
        <label htmlFor={id}>{label}</label>
    </div>;
}

// TODO echte Validierung
export function NumberInput({ id, label, value, setState, numFractionDigits }) {
    numFractionDigits = numFractionDigits || 2;
    return <>
        <TextInput
            classes="text-end"
            id={id}
            label={label}
            value={value}
            onInput={e => setState(e.target.value)}
            onBlur={e => {
                try {
                    // TODO visuelle Validierung hinzufügen
                    setState(prettyPrintFloatString(e.target.value, numFractionDigits));
                } catch (error) {
                    console.error(error);
                }
            }}
            attrs={{
                inputMode: "numeric"
            }} />
    </>;
}

export function DateInput({ id, label, value, setState }) {
    return <TextInput
        id={id}
        label={label}
        value={value}
        onChange={e => setState(e.target.value)}
        attrs={{ type: 'date' }} />
}

export default function Form({ id, title, abortAction, deleteAction, saveAction, children }) {

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
            className="container"
            autoComplete="off"
            onSubmit={event => {
                event.preventDefault();
                saveAction();
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
