import React, {FC, useState} from 'react'
import { Outlet } from 'react-router-dom'

import useUserInfoStore from '../../store/user/store';
import {
    Header,
    MainNavigation
} from '@exirain/header/src/index';
import './Layout.scss'
import {useQuery} from "@tanstack/react-query";

const Layout: FC = () => {
    const CACHE_NAME = 'mainmenu-cache';

    const [MainMenuItems, setMainMenuItems] = useState([])

    const  {data, isLoading, status}  = useQuery({
        queryKey: [import.meta.env.REACT_APP_MENU_PATH,import.meta.env.REACT_APP_MENU_URL],
        onSuccess: (res: any) => {
            try {
                setMainMenuItems(res);
                localStorage.setItem(CACHE_NAME, JSON.stringify(res));
            } catch (e) {
                console.log(e);
            }
        },
        onError: (error: any) => {
            setMainMenuItems(getCache());
        }

    });

    function getCache(): any {
        const cache = localStorage.getItem(CACHE_NAME) || '{}';
        return JSON.parse(cache);
    }

    console.log(MainMenuItems)

  return (
    <div className="layout">
      {/*<MainNavigation />*/}
      <MainNavigation items={MainMenuItems}/>
      <div className="layout__wrapper">
        <Header
        user={useUserInfoStore.getState()}/>
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
