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

    return (
        <div id="app" className='h-100 d-flex flex-column'>
            <Navbar viewMode={viewMode} setViewMode={setViewMode}>
                {props.navbarContent}
            </Navbar>
            <TagContext.Provider value={tags}>
                <div className="container-lg overflow-hidden">
                    <div className="row h-100">
                        <div id="main" className='col-md col-lg-8 overflow-auto pt-2'>
                            {props.main}
                        </div>
                        <div id="side" className='col-md col-lg-4 overflow-hidden pe-0 position-relative'>
                            <div className="overflow-auto w-100 h-100 pt-2">
                                {props.side}
                            </div>
                            <div id="drawer-right" className={`position-absolute top-0 ${drawerPosStart} overflow-auto w-100 h-100 bg-white pt-2`}>
                                {props.rightDrawerVisible ? props.rightDrawer() : null}
                            </div>
                        </div>
                    </div>
                </div>
            </TagContext.Provider>
        </div>
    );
}
