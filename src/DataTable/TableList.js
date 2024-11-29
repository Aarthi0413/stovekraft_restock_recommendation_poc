import React, { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Button } from "../components/ui/button"
import { ArrowUpDown, ChevronDown, Loader2 } from "lucide-react"
import Select from 'react-select';
import domo from "ryuu.js";
import { successToast } from 'components/Toaster/Toaster';

const TableList = ({ data, branch }) => {

  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})
  // Set initial page size to 10
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5, // Limit rows per page to 10
  });

  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [selectedRequiredQuantity, setSelectedRequiredQuantity] = useState(null);
  const [filteredData, setFilteredData] = useState(data);
  const [loading, setLoading] = useState({});

  //product name in dropdown 
  const uniqueProductNames = React.useMemo(() => {
    const uniqueNames = [...new Set(data.map(item => item["Product Name"]))];
    return uniqueNames.map(name => ({
      value: name,
      label: name
    }));
  }, [data]);

  const requiredQuantityOptions = [
    { value: 10, label: '10' },
    { value: 100, label: '100' },
    { value: 1000, label: '1000' },
    { value: 10000, label: '10000' },
  ];

  const handleRestock = (rowData) => {

    const originalQuantity = rowData["Quantity Needed"];
    const multipliedQuantity = selectedRequiredQuantity
      ? originalQuantity * selectedRequiredQuantity
      : originalQuantity;
    setLoading(prev => ({ ...prev, [rowData.id]: true }));

    const data = {
      to: domo.env.userEmail,
      subject: `Restock Request for ${rowData["Product Name"]}`,
      body: `
      <p>I hope this message finds you well.</p>

      <p>We need to restock the following product:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4;">Raw Material</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4;">Quantity Needed</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4;">Current Inventory</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4;">Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${rowData["Raw Material"]}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              ${multipliedQuantity} 
              ${selectedRequiredQuantity ? `(${originalQuantity} x ${selectedRequiredQuantity})` : ''}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">${rowData["Inventory Quantity"]}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${rowData["Unit"]}</td>
          </tr>
        </tbody>
      </table>

      <p>Please confirm the availability and delivery schedule for this item at your earliest convenience.</p>

      <p>Thank you for your attention.</p>
      `,
    }

    domo.post(`/domo/workflow/v1/models/test/start`, data)
      .then(response => {
        if (response) {
          successToast(`Restock request submitted for ${rowData["Product Name"]}`);
        }
      })
      .catch(error => {
        console.error('Error starting workflow:', error);
      })
      .finally(() => {
        setLoading(prev => {
          const newLoading = { ...prev };
          delete newLoading[rowData.id];
          return newLoading;
        });
      })
  };


  const columns = [
    {
      accessorKey: "Product Name",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("Product Name")}</div>
      ),
    },
    {
      accessorKey: "Raw Material",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Raw Material
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <div className="capitalize">{row.getValue("Raw Material")}</div>,
    },
    {
      accessorKey: "Inventory Quantity",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Inventory Quantity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("Inventory Quantity")}</div>,
    },
    {
      accessorKey: "Quantity Needed",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Quantity Needed
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const originalQuantity = row.getValue("Quantity Needed");
        const multipliedQuantity = selectedRequiredQuantity
          ? originalQuantity * selectedRequiredQuantity
          : originalQuantity;
        return <div className="lowercase">{multipliedQuantity}</div>;
      },
    },
    {
      accessorKey: "Unit",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Unit
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <div className="capitalize">{row.getValue("Unit")}</div>,
    },
    {
      accessorKey: "Status",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const rowData = { ...row.original, id: row.id };
        const inventoryQuantity = row.getValue("Inventory Quantity");
        const quantityNeeded = row.getValue("Quantity Needed");

        let currentStatus = inventoryQuantity >= quantityNeeded ? "Available" : "Restock";
        
        const multipliedQuantityValue = selectedRequiredQuantity
          ? quantityNeeded * selectedRequiredQuantity
          : quantityNeeded;

        currentStatus = inventoryQuantity >= multipliedQuantityValue ? "Available" : "Restock";


        const buttonClass = currentStatus === "Restock"
          ? 'bg-[#f06159] py-1 px-2 w-20 rounded uppercase text-center text-white text-[12px] font-medium'
          : 'bg-[#34a0a4] hover:bg-[#6ac0c2] py-1 px-2 w-20 rounded uppercase text-center text-white text-[12px] font-medium';

        return currentStatus === "Restock" ? (
          <Button
            className={buttonClass}
            onClick={() => handleRestock(rowData)}
            disabled={loading[row.id]}
          >
            {loading[row.id] ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </div>
            ) : (
              "Restock"
            )}
          </Button>
        ) : (
          <div className={buttonClass}>{currentStatus}</div>
        );
      },
    },
  ]


  const [isClearableText, setIsClearableText] = React.useState(true)

  const handleProductFilterData = (selectedOption) => {
    setIsClearableText(true)
    setSelectedProduct(selectedOption?.value || null);
    table.getColumn('Product Name')?.setFilterValue(selectedOption?.value || "");
  };

  const handleRequiredQuantityChange = (selectedOption) => {
    setSelectedRequiredQuantity(selectedOption ? selectedOption.value : null);
  };

  React.useEffect(() => {
    let filtered = [...data];

    if (selectedProduct) {
      filtered = filtered.filter(item => item['Product Name'] === selectedProduct);
    }

    setFilteredData(filtered);
  }, [selectedProduct, data]);


  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  })

  const totalPages = table.getPageCount();

  return (
    <div className="w-full">
      <div className="flex justify-between md:items-center py-4 md:flex-row flex-col">
        <div className='flex items-center'>
          <Select
            isClearable
            value={selectedProduct ? { value: selectedProduct, label: selectedProduct } : null}
            onChange={handleProductFilterData}
            options={uniqueProductNames}
            placeholder="Filter by Product Name"
            className="max-w-sm"
          />
          <Select
            isClearable
            value={selectedRequiredQuantity ? { value: selectedRequiredQuantity, label: selectedRequiredQuantity.toString() } : null}
            onChange={handleRequiredQuantityChange}
            options={requiredQuantityOptions}
            placeholder="Select Required Quantity"
            className="max-w-sm ml-2"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-black">
          <div>
            Record count{" "}
            <span className="font-bold">{table.getFilteredRowModel().rows.length}</span>
          </div>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TableList;