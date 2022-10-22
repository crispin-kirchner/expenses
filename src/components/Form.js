import Navbar, { LinkButton } from "./Navbar";

import React from "react";
import t from "../utils/texts";

export default function Form(props) {
    return (<>
        <div className="d-md-none mb-2">
            <Navbar>
                <div className="w-100 d-flex justify-content-between me-0">
                    {props.title('btn-dark')}
                    <LinkButton icon="bi-x-lg" onClick={props.abortAction} />
                </div>
            </Navbar>
        </div>
        <form className="container" id="expense-form" autoComplete="off" onSubmit={props.saveAction} noValidate>
            <div className="justify-content-between align-items-center mt-2 mb-2 d-none d-md-flex">
                {props.title('btn-outline-dark')}
                <button type="button" className="btn-close" onClick={props.abortAction} />
            </div>
            {props.children}
            <div className="d-flex flex-row-reverse mt-2">
                <button className="btn btn-primary ms-2" type="submit" title={t('Save')}>
                    <i className="bi-check-circle"></i>
                    &nbsp;{t('Save')}
                </button>
                {props.deleteAction ?
                    <button id="delete-button" className="btn btn-outline-danger" type="button" title={t('Delete')} onClick={props.deleteAction}>
                        <i className="bi-trash"></i>
                        &nbsp;{t('Delete')}
                    </button> : null}
            </div>
        </form>
    </>);
}
