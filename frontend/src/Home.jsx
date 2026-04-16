import React from 'react';
import Navbar from './Main-Panel/layouts/HomeLayout';
import ActorGrid from './pages/Actor/ActorSection';
// apify ko dekhkar   main design hai yeh ise dekhakr banana hia bhai

export default function Home(){
    return (
        <>
            <Navbar />
           < ActorGrid />
        </>
    )
}