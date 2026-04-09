import { Paper } from "@mui/material"

export function Card({ children, className }) {
    return (
        <Paper variant="outlined" className={`p-4 sm:p-10 flex flex-col gap-4 ${className}`}>
            {children}
        </Paper>
    )
}