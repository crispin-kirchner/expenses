import Navbar, { LinkButton } from "./Navbar";

import React from "react";
import { formatFloat } from "../utils/formats";
import t from "../utils/texts";

function Title(props) {
    return (<>
        {props.closeButton}
        <div className="me-auto">
            {props.content(props.classes)}
        </div>
        {
            props.deleteAction ?
                <button id="delete-button" className="btn btn-outline-danger" type="button" title={t('Delete')} onClick={props.deleteAction}>
                    <i className="bi-trash"></i>
                    &nbsp;{t('Delete')}
                </button> : null
        }
        <button className="btn btn-primary ms-2" type="submit" title={t('Save')}>
            <i className="bi-check-circle"></i>
            &nbsp;{t('Save')}
        </button>
    </>);
}

export function FormRow(props) {
    return <div className="row g-2 mb-2">{props.children}</div>;
}

// TODO echte Validierung
export function NumberInput(props) {
    return <>
        <input
            className="form-control text-end"
            id={props.id}
            placeholder={props.label}
            inputMode="numeric"
            defaultValue={props.defaultValue}
            onInput={e => props.onChange(e.target.value)}
            onBlur={e => {
                const validated = formatFloat(e.target.value, props.numFractionDigits || 2);
                e.target.value = validated;
                props.onChange(validated);
            }} />
        {props.label ? <label htmlFor={props.id}>{props.label}</label> : null}
    </>;
}

export default function Form(props) {
    return (<>
        <div className="d-md-none mb-2">
            <Navbar>
                <div className="w-100 d-flex align-items-center">
                    <Title content={props.title} abortAction={props.abortAction} deleteAction={props.deleteAction} classes="btn-dark" closeButton={<LinkButton onClick={props.abortAction} icon="bi-x-lg"></LinkButton>} />
                </div>
            </Navbar>
        </div>
        <form className="container" autoComplete="off" onSubmit={props.saveAction} noValidate>
            <div className="align-items-center mt-2 mb-2 d-none d-md-flex">
                <Title content={props.title} deleteAction={props.deleteAction} classes="btn-outline-dark" closeButton={<button type="button" className="btn-close me-2" onClick={props.abortAction} />} />
            </div>
            {props.children}
        </form>
    </>);
}
