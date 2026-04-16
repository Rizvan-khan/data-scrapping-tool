import React from 'react';
import Navbar from './Main-Panel/layouts/HomeLayout';
// https://www.scrapin.io/blog/instant-data-scraper-alternatives  main design hai yeh ise dekhakr banana hia bhai

export default function Home(){
    return (
        <>
            <Navbar />
            {/* pt-20 adds enough space so content starts after the navbar */}
            <main className="pt-20 px-4">
                <h2>Home page is working fine</h2>
                {/* https://console.apify.com/actors/2Mdma1N6Fd0y3QEjR/input */}
            </main>
        </>
    )
}