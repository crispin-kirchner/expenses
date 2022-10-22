import * as ViewMode from '../enums/ViewMode.js';

import React, { useEffect, useState } from "react";

import Navbar from './Navbar';
import TagContext from './TagContext.js';
import { getTagsAndHierarchy } from '../services/TagService.js';

// FIXME re-add viewmode changing when adding sidebar
export default function Outline(props) {
    const [viewMode, setViewMode] = useState(ViewMode.MONTH_DISPLAY);
    const [tags, setTags] = useState(null);
    useEffect(() => {
        getTagsAndHierarchy()
            .then(setTags);
    }, []); // FIXME how to invalidate

    const drawerPosStart = props.rightDrawerVisible ? 'start-0' : 'start-100';
    const mainClasses = props.sideOnMobile ? 'h-50' : 'h-100';
    const sideClasses = props.sideOnMobile ? '' : 'd-none d-md-block';

    // FIXME Inhalt des Drawers behalten, bis der aus dem Bild verschwunden ist
    return (
        <div id="app" className='d-flex h-100 flex-column overflow-hidden position-relative'>
            <Navbar viewMode={viewMode} setViewMode={setViewMode}>
                {props.navbarContent}
            </Navbar>
            <TagContext.Provider value={tags}>
                <div className="container-lg flex-grow-1 h-100 overflow-hidden">
                    <div className="row h-100">
                        <div id="main" className={`col-md col-lg-8 h-md-100 overflow-auto pt-2 ${mainClasses}`}>
                            {props.main}
                        </div>
                        <div id="side" className={`col-md col-lg-4 h-50 h-md-100 px-0 ${sideClasses} position-md-relative`}>
                            <div className="overflow-auto pt-2 h-100 gutter-padding">
                                {props.side}
                            </div>
                            <div id="drawer-right" className={`position-absolute top-0 ${drawerPosStart} overflow-auto w-100 h-100 bg-white`}>
                                {props.rightDrawerVisible ? props.rightDrawer() : null}
                            </div>
                        </div>
                    </div>
                </div>
            </TagContext.Provider>
            {props.footerContent ? <div className="d-md-none bg-secondary d-flex p-2" style={{ '--bs-bg-opacity': 0.5 }}>
                {props.footerContent}
            </div> : null
            }
        </div >
    );
}
