import { useState, useRef } from 'react'
import { Tabs, Tab } from '@mui/material'

// I expect the tabs prop to be formatted as follows:
// [
//     {
//         label: 'Tab 1',
//         index: 0,
//         panel: <div>Tab 1 content</div>
//     }
// ]


export function ScrollableTabs({ tabs, name }) {
    const [value, setValue ] = useState(0)
    const tabsRef = useRef(null)

    const handleChange = (event, newValue) => {
        setValue(newValue)
        // Find the clicked tab element and scroll it into view
        const tabElement = tabsRef.current.querySelector(`[id="simple-tab-${name}-${tabs[newValue].index}"]`)
        if (tabElement) {
            const headerHeight = 120 // Adjust this value based on your actual header height
            const elementPosition = tabElement.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Tabs
                ref={tabsRef}
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="scrollable auto tabs"
            >
                {tabs.map((tab) => (
                    <Tab 
                        key={`${name}-${tab.index}`}
                        label={tab.label} 
                        id={`simple-tab-${name}-${tab.index}`} 
                        aria-controls={`simple-tabpanel-${name}-${tab.index}`} 
                    />
                ))}
            </Tabs>

            {tabs.map((tab) => (
                <div 
                    key={`${name}-${tab.index}`}
                    role="tabpanel" 
                    index={tab.index} 
                    hidden={value !== tab.index} 
                    id={`simple-tabpanel-${name}-${tab.index}`} 
                    aria-labelledby={`simple-tab-${name}-${tab.index}`}
                >
                    {tab.panel}
                </div>
            ))}
        </div>
    )
}