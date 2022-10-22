import * as ViewMode from '../enums/ViewMode.js';

import React, { useEffect, useState } from "react";

import Blindtext from './Blindtext.js';
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

    return (
        <div id="app" className='d-flex h-100 flex-column bg-secondary' style={{ '--bs-bg-opacity': .5 }}>
            <Navbar viewMode={viewMode} setViewMode={setViewMode}>
                {props.navbarContent}
            </Navbar>
            <TagContext.Provider value={tags}>
                <div className="container-lg flex-grow-1 h-100 overflow-hidden">
                    <div className="row h-100">
                        <div id="main" className='col-md col-lg-8 h-50 h-md-100 overflow-auto pt-2 bg-warning' style={{ '--bs-bg-opacity': .5 }}>
                            {/* FIXME wieder reinnehmen props.main*/}
                            <Blindtext numParagraphs={5} />
                        </div>
                        <div id="side" className='col-md col-lg-4 h-50 h-md-100 px-0'>
                            <div className="overflow-auto pt-2 h-100">
                                {/* FIXME wieder reinnehmen props.side*/}
                                <Blindtext numParagraphs={3} />
                            </div>
                            {/*<div id="drawer-right" className={`position-absolute top-0 ${drawerPosStart} overflow-auto w-100 h-100 bg-white pt-2`}>
                                {props.rightDrawerVisible ? props.rightDrawer() : null}
    </div>*/}
                        </div>
                    </div>
                </div>
            </TagContext.Provider>
            <div className="bg-primary d-md-none" style={{ height: '40px', '--bs-bg-opacity': .5 }}>

            </div>
        </div>
    );
}
