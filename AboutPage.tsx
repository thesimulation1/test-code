import styles from "../components/AboutPage.module.css";
import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Search } from "lucide-react";

interface Team {
  id: number;
  name: string;
  city: string;
  founded: number;
}

function AboutPage() {
  const baseTeams: Team[] = [
    { id: 1, name: "Yankees", city: "New York", founded: 1901 },
    { id: 2, name: "Dodgers", city: "Los Angeles", founded: 1883 },
    { id: 3, name: "Red Sox", city: "Boston", founded: 1901 },
    { id: 4, name: "Cubs", city: "Chicago", founded: 1876 },
    { id: 5, name: "Giants", city: "San Francisco", founded: 1883 },
  ];

  // Duplicate teams
  const teamsArray: Team[] = [];
  for (let i = 0; i < 200; i++) {
    baseTeams.forEach(team => {
      teamsArray.push({
        ...team,
        id: i * baseTeams.length + team.id,
        name: `${team.name} ${i + 1}`
      });
    });
  }

  const [teams] = useState<Team[]>(teamsArray);

  // Per-column filters
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({
    name: "",
    city: "",
    founded: ""
  });

  // Track which column's filter is visible
  const [showFilters, setShowFilters] = useState<{ [key: string]: boolean }>({
    name: false,
    city: false,
    founded: false,
  });

  // Pagination and sorting
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Get columns
  const columns = teams[0]
    ? Object.keys(teams[0]).filter(key => key !== "id")
    : ["name", "city", "founded"];

  // Filtering per column
  const filteredTeams = teams.filter(team =>
    columns.every(col => {
      const filterValue = columnFilters[col];
      if (!filterValue) return true;
      return String(team[col as keyof Team]).toLowerCase().includes(filterValue.toLowerCase());
    })
  );

  // Sorting
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    if (sortCol === null) return 0;
    const aValue = a[sortCol as keyof Team];
    const bValue = b[sortCol as keyof Team];
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return sortDir === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Pagination
  const totalPages = Math.ceil(sortedTeams.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentTeams = sortedTeams.slice(startIdx, startIdx + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Sorting handler
  const handleSort = (col: string) => {
    const newDir = sortCol === col && sortDir === 'asc' ? 'desc' : 'asc';
    setSortCol(col);
    setSortDir(newDir);
    setCurrentPage(1);
  };

  // Column filter handler
  const handleColumnFilter = (col: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [col]: value
    }));
    setCurrentPage(1);
  };

  // Toggle filter input for a column
  const toggleFilter = (col: string) => {
    setShowFilters(prev => ({
      ...prev,
      [col]: !prev[col]
    }));
  };

  const [jumpInput, setJumpInput] = useState<{ type: "start" | "end" | null, value: string }>({ type: null, value: "" });

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Teams</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {columns.map(col => (
                <th key={col} className="py-2 px-4 border-b text-left align-top">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSort(col)}
                      className="flex items-center"
                    >
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                      {sortCol === col && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                    <button
                      onClick={() => toggleFilter(col)}
                      className="ml-1 text-gray-500 hover:text-black"
                      aria-label={`Show filter for ${col}`}
                      tabIndex={0}
                      type="button"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                  {showFilters[col] && (
                    <input
                      type="text"
                      value={columnFilters[col]}
                      onChange={e => handleColumnFilter(col, e.target.value)}
                      placeholder={`Search ${col}`}
                      className="mt-1 block w-full p-1 border rounded text-sm"
                      autoFocus
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentTeams.length === 0 ? (
              <tr className={styles["fade-in"]}>
                <td colSpan={columns.length} className="text-center text-gray-500 py-4">
                  No teams found.
                </td>
              </tr>
            ) : (
              currentTeams.map(team => (
                <tr key={team.id} className={styles["fade-in"]}>
                  {columns.map(col => (
                    <td key={col} className="py-2 px-4 border-b">
                      {team[col as keyof Team]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-4 justify-center">
        <Button variant="outline" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </Button>
        {(() => {
          const pageButtons = [];
          let start = Math.max(1, currentPage - 2);
          let end = Math.min(totalPages, currentPage + 2);

          if (start > 1) {
            pageButtons.push(
              <Button key={1} variant={currentPage === 1 ? "default" : "outline"} onClick={() => goToPage(1)}>
                1
              </Button>
            );
            if (start > 2) {
              pageButtons.push(
                jumpInput.type === "start" ? (
                  <input
                    key="start-jump"
                    type="number"
                    min={2}
                    max={start - 1}
                    value={jumpInput.value}
                    onChange={e => setJumpInput({ type: "start", value: e.target.value })}
                    onBlur={() => setJumpInput({ type: null, value: "" })}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        const page = Number(jumpInput.value);
                        if (page >= 2 && page < start) {
                          goToPage(page);
                        }
                        setJumpInput({ type: null, value: "" });
                      }
                    }}
                    className="w-12 px-1 py-0.5 border rounded text-center"
                    autoFocus
                  />
                ) : (
                  <button
                    key="start-ellipsis"
                    className="px-2 text-gray-500 hover:text-black"
                    onClick={() => setJumpInput({ type: "start", value: "" })}
                    tabIndex={0}
                    aria-label="Jump to page"
                    type="button"
                  >
                    ...
                  </button>
                )
              );
            }
          }

          for (let i = start; i <= end; i++) {
            pageButtons.push(
              <Button
                key={i}
                variant={currentPage === i ? "default" : "outline"}
                onClick={() => goToPage(i)}
              >
                {i}
              </Button>
            );
          }

          if (end < totalPages) {
            if (end < totalPages - 1) {
              pageButtons.push(
                jumpInput.type === "end" ? (
                  <input
                    key="end-jump"
                    type="number"
                    min={end + 1}
                    max={totalPages - 1}
                    value={jumpInput.value}
                    onChange={e => setJumpInput({ type: "end", value: e.target.value })}
                    onBlur={() => setJumpInput({ type: null, value: "" })}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        const page = Number(jumpInput.value);
                        if (page > end && page < totalPages) {
                          goToPage(page);
                        }
                        setJumpInput({ type: null, value: "" });
                      }
                    }}
                    className="w-12 px-1 py-0.5 border rounded text-center"
                    autoFocus
                  />
                ) : (
                  <button
                    key="end-ellipsis"
                    className="px-2 text-gray-500 hover:text-black"
                    onClick={() => setJumpInput({ type: "end", value: "" })}
                    tabIndex={0}
                    aria-label="Jump to page"
                    type="button"
                  >
                    ...
                  </button>
                )
              );
            }
            pageButtons.push(
              <Button key={totalPages} variant={currentPage === totalPages ? "default" : "outline"} onClick={() => goToPage(totalPages)}>
                {totalPages}
              </Button>
            );
          }

          return pageButtons;
        })()}
        <Button variant="outline" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default AboutPage;
