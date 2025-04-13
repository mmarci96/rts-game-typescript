import { Table, TableHeader, TableColumn, TableBody } from "@heroui/react";

export const GameTable = () => {
    return (
        <Table aria-label="Example empty table">
            <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
        </Table>
    );
};
