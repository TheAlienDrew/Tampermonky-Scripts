// ==UserScript==
// @name         Microsoft Teams - Auto Device Theme
// @namespace    https://drewj.la/
// @version      1.1.0
// @description  Makes Microsoft Teams match the device theme at all times.
// @author       Andrew Larson
// @license      GPL-3.0-or-later
// @match        https://teams.microsoft.com/*
// @match        https://teams.microsoft365.com/*
// @updateURL    https://raw.githubusercontent.com/Andrew-J-Larson/Custom-JS/main/!-User-Scripts/Microsoft/Teams-Auto-Device-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Andrew-J-Larson/Custom-JS/main/!-User-Scripts/Microsoft/Teams-Auto-Device-Theme.user.js
// @icon         https://statics.teams.cdn.office.net/hashedassets/favicon/prod/favicon-34ed16c5.ico
// @grant        none
// @noframes
// ==/UserScript==

/* Copyright (C) 2024  Andrew Larson (github@drewj.la)

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/* globals getStoredTheme */

const INTERVAL_SPEED = 5; // ms
const NEW_TEAMS_PATHNAME_STARTER = '/v2/';
const settingsMenuButtonSelector = '#settings-menu-button';
const settingsButtonSelector = 'button[data-tid="settingsDropdownOptionsButton"]';
const generalTabSelector = 'div[data-tid="optionsSettingsDialog-General"]';
const closeButtonSelector = 'button[aria-label="Close Settings"]';
const lightModeOptionSelector = 'li.theme-item[data-tid="default-theme"]';
const darkModeOptionSelector = 'li.theme-item[data-tid="dark-theme"]';

// if new Teams is sensed, abort the script, since the new version already has built-in system theming
if ((window.location.pathname).startsWith(NEW_TEAMS_PATHNAME_STARTER)) {
    console.warn('New Teams detected, Auto Device Theme script aborted.')
} else {
    var watchEventTriggered = false;
    var activeElement = null;
    var settingsMenuButton; // gets set later
    
    function updateTheme(changeToScheme) {
        let html = document.querySelector('html');
    
        let theme = getStoredTheme();
        if (theme.contains('dark')) {
            theme = 'dark';
        } else {
            theme = 'light';
        }
    
        if (theme != changeToScheme && !document.hidden) { // teams settings won't always change when the window is hidden
            settingsMenuButton.click();
    
            let waitForMoreSettings = setInterval(function () {
                let settingsButton = document.querySelector(settingsButtonSelector);
                if (settingsButton) {
                    clearInterval(waitForMoreSettings);
                    settingsButton.click();
    
                    let waitForSettingsModal = setInterval(function () {
                        let generalTab = document.querySelector(generalTabSelector);
                        if (generalTab) {
                            clearInterval(waitForSettingsModal);
                            generalTab.click();
    
                            let closeButton, lightModeOption, darkModeOption;
                            let waitForGeneralSettings = setInterval(function () {
                                closeButton = document.querySelector(closeButtonSelector);
                                lightModeOption = document.querySelector(lightModeOptionSelector);
                                darkModeOption = document.querySelector(darkModeOptionSelector);
                                if (closeButton && lightModeOption && darkModeOption) {
                                    clearInterval(waitForGeneralSettings);
    
                                    let changeThemeOption = document.querySelector(changeToScheme == 'dark' ? darkModeOptionSelector : lightModeOptionSelector);
                                    changeThemeOption.click();
                                    closeButton.click();
    
                                    if (watchEventTriggered) activeElement.focus();
                                }
                            }, INTERVAL_SPEED);
                        }
                    }, INTERVAL_SPEED);
                }
            }, INTERVAL_SPEED);
        }
    
        watchEventTriggered = false;
    }
    
    // wait for the page to be fully loaded
    window.addEventListener('load', function () {
        let waitForSettingsButton = setInterval(function () {
            settingsMenuButton = document.querySelector(settingsMenuButtonSelector);
            if (settingsMenuButton) {
                clearInterval(waitForSettingsButton);
    
                // now we can start
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                    const newColorScheme = e.matches ? 'dark' : 'light';
                    watchEventTriggered = true;
                    activeElement = document.activeElement;
                    updateTheme(newColorScheme);
                });
    
                // first time run
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    // dark mode
                    updateTheme('dark');
                } else {
                    // light mode
                    updateTheme('light');
                }
            }
        }, INTERVAL_SPEED);
    }, false);
}
