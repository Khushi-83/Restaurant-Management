"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";

export default function FeedbackForm() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("19:30");

  const categories = [
    "Food Quality",
    "Cleanliness",
    "Speed of Service",
    "Overall Experience",
  ];

  const options = [
    { label: "Excellent", icon: "😄", color: "bg-green-100 border-green-500" },
    { label: "Good", icon: "🙂", color: "bg-blue-100 border-blue-500" },
    { label: "Average", icon: "😐", color: "bg-yellow-100 border-yellow-500" },
    { label: "Dissatisfied", icon: "😞", color: "bg-red-100 border-red-500" },
  ];

  return (
    <Card className="max-w-5xl mx-auto mt-10 p-6 md:p-10 shadow-2xl rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-sky-50 to-blue-100">
      <CardContent>
        <h2 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
          We appreciate your feedback!
        </h2>

        {/* User Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <Label>Name</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="First Name"
                className="w-1/2 bg-white border-blue-200 focus:border-blue-500"
              />
              <Input
                placeholder="Last Name"
                className="w-1/2 bg-white border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="example@example.com"
              className="mt-2 bg-white border-blue-200 focus:border-blue-500"
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              placeholder="(000) 000-0000"
              className="mt-2 bg-white border-blue-200 focus:border-blue-500"
            />
          </div>

          <div>
            <Label>Dine In / Take Out</Label>
            <ToggleGroup type="single" className="mt-2 flex gap-3">
              <ToggleGroupItem
                value="dine"
                className="px-4 py-2 rounded-lg border text-sm data-[state=on]:bg-green-100 data-[state=on]:border-green-500"
              >
                Dine In
              </ToggleGroupItem>
              <ToggleGroupItem
                value="takeout"
                className="px-4 py-2 rounded-lg border text-sm data-[state=on]:bg-purple-100 data-[state=on]:border-purple-500"
              >
                Take Out
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10">
          <div>
            <Label className="text-gray-600">Day Visited</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) setDate(selectedDate);
              }}
              className="mt-2 border rounded-md shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-2 w-28 border-blue-300"
              />
            </div>
            <div>
              <Label>Period</Label>
              <select className="mt-2 w-20 h-10 border rounded-md border-blue-300">
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <Label className="block mb-3 text-gray-700 font-medium">
                {category}
              </Label>
              <ToggleGroup type="single" className="flex gap-3 flex-wrap">
                {options.map((opt) => (
                  <ToggleGroupItem
                    key={opt.label}
                    value={opt.label.toLowerCase()}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition hover:scale-105 ${opt.color} data-[state=on]:scale-110`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-sm font-semibold">{opt.label}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          ))}
        </div>

        

        {/* Submit Button */}
        <Button className="mt-10 w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-3 text-lg shadow-md">
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}
