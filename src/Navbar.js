import React from 'react';

console.log(process.env);

function Navbar() {
    return (
        <nav id="navbar" className="navbar navbar-dark bg-dark">
            <div className="container">
                <div className='navbar-brand'>
                    Ausgaben
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
