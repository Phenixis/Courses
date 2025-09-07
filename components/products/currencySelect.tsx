"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CurrencySelect() {
    const searchParams = useSearchParams();
    const [currency, setCurrency] = useState(searchParams.get("currency") || "eur");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (currency) {
            params.set("currency", currency);
        } else {
            params.delete("currency");
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }, [currency]);

    return (
        <Select value={currency} onValueChange={(value) => setCurrency(value)}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="eur" onClick={() => setCurrency("eur")}>EUR (€)</SelectItem>
                <SelectItem value="usd" onClick={() => setCurrency("usd")}>USD ($)</SelectItem>
                <SelectItem value="gbp" onClick={() => setCurrency("gbp")}>GBP (£)</SelectItem>
                <SelectItem value="chf" onClick={() => setCurrency("chf")}>CHF (CHF)</SelectItem>
            </SelectContent>
        </Select>
    );
};