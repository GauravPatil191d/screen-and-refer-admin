"use client";

import React from "react";
import { Inbox } from "lucide-react";
import "./style.css";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyText?: string;
  emptySubtext?: string;
  className?: string;
  actions?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyText = "No records found",
  emptySubtext = "Get started by adding your first item above.",
  className = "",
  actions,
  title,
  subtitle,
}: TableProps<T>) {
  return (
    <div className={`hexar-table-card ${className}`}>
      {(title || actions) && (
        <div className="hexar-table-header flex justify-between items-center">
          <div>
            {title && <h3 className="hexar-table-title font-bold">{title}</h3>}
            {subtitle && <p className="hexar-table-subtitle text-xs mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="hexar-table-actions">{actions}</div>}
        </div>
      )}

      <div className="hexar-table-wrapper">
        <table className="hexar-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, textAlign: col.align || "left" }}
                  className="hexar-th"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={keyExtractor(item, index)} className="hexar-tr">
                  {columns.map((col) => (
                    <td
                      key={`${keyExtractor(item, index)}-${col.key}`}
                      style={{ textAlign: col.align || "left" }}
                      className="hexar-td"
                    >
                      {col.render
                        ? col.render(item, index)
                        : (item as any)[col.key] !== undefined
                        ? String((item as any)[col.key])
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="hexar-table-empty">
                    <div className="hexar-empty-icon-wrapper">
                      <Inbox className="w-8 h-8 text-[#123B8C]" />
                    </div>
                    <div className="hexar-empty-text">{emptyText}</div>
                    {emptySubtext && <div className="hexar-empty-subtext">{emptySubtext}</div>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
