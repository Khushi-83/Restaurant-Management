"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { ChevronRight } from "lucide-react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function FeedbackForm() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("19:30");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    diningOption: "",
    ratings: {} as Record<string, string>,
    comments: ""
  });

  // Connect to socket when component mounts
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
      toast.success("Connected to server");
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setConnectionError(error.message);
      toast.error(`Connection error: ${error.message}`);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      toast.error(`Disconnected: ${reason}`);
    });

    // Listen for feedback submission confirmation
    socket.on("feedback_received", () => {
      toast.success("Thank you for your feedback! We appreciate your input.");
    });

    socket.on("feedback_error", (error) => {
      toast.error(`Error: ${error.message}`);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const categories = [
    "Food Quality",
    "Cleanliness",
    "Speed of Service",
    "Overall Experience",
  ];

  const options = [
    { label: "Excellent", icon: "😄", color: "bg-green-100 border-green-500 hover:bg-green-200" },
    { label: "Good", icon: "🙂", color: "bg-blue-100 border-blue-500 hover:bg-blue-200" },
    { label: "Average", icon: "😐", color: "bg-yellow-100 border-yellow-500 hover:bg-yellow-200" },
    { label: "Dissatisfied", icon: "😞", color: "bg-red-100 border-red-500 hover:bg-red-200" },
  ];

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error("Please fill in your name and email");
        return;
      }

      setIsSubmitting(true);
      console.log("Form data:", formData);
      console.log("Socket connected:", socket.connected);
      
      const feedbackData = {
        ...formData,
        date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time,
        submitted_at: new Date().toISOString()
      };

      console.log("Sending feedback data:", feedbackData);

      // Try socket first, then HTTP as fallback
      if (socket.connected) {
        socket.emit("submit_feedback", feedbackData);
        console.log("Feedback sent via socket");
      } else {
        // Fallback to HTTP POST
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit feedback');
        }
        
        console.log("Feedback sent via HTTP");
      }

      // Show success message
      toast.success("Submission Successful! Thank you for your feedback.");

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        diningOption: "",
        ratings: {},
        comments: ""
      });
      setDate(new Date());
      setTime("19:30");

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6">
      {/* Connection Status */}
      <div className={`fixed top-4 right-4 px-4 py-2 rounded-full text-sm font-medium ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-1000'
      }`}>
        {isConnected ? 'Connected' : connectionError || 'Disconnected'}
      </div>

      {/* Hero Section */}
      <div className="text-center mb-10">
       <Badge className="bg-red-200 text-red-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
            Share Your Experience
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gray-900 mb-4">
          We Value Your Feedback
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Your opinion helps us improve our service and create better dining experiences for everyone.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto shadow-xl rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8 md:p-10">
          {/* User Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <Label className="text-gray-700">Name</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="bg-white/50 border-gray-200 focus:border-red-500 transition-colors"
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="bg-white/50 border-gray-200 focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Email</Label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-white/50 border-gray-200 focus:border-red-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Phone Number</Label>
              <Input
                type="tel"
                placeholder="(000) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-white/50 border-gray-200 focus:border-red-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Dining Option</Label>
              <ToggleGroup 
                type="single" 
                className="flex gap-3"
                value={formData.diningOption}
                onValueChange={(value) => setFormData({...formData, diningOption: value})}
              >
                <ToggleGroupItem
                  value="dine"
                  className="px-4 py-2 rounded-lg border text-sm bg-white/50 data-[state=on]:bg-red-100 data-[state=on]:border-red-500 transition-all"
                >
                  Dine In
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="takeout"
                  className="px-4 py-2 rounded-lg border text-sm bg-white/50 data-[state=on]:bg-red-100 data-[state=on]:border-red-500 transition-all"
                >
                  Take Out
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Date & Time Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="space-y-2">
              <Label className="text-gray-700">Day Visited</Label>
              {date && (
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {date.toLocaleDateString()}
                </p>
              )}
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  console.log("Date selected:", newDate);
                  setDate(newDate);
                }}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="border rounded-lg shadow-sm bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Time of Visit</Label>
              <div className="flex gap-3">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-red-500"
                />
                <select 
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white/50 focus:border-red-500 outline-none"
                  aria-label="Time period"
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ratings Section */}
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category} className="space-y-3">
                <Label className="text-gray-700 font-medium">{category}</Label>
                <ToggleGroup 
                  type="single" 
                  className="flex flex-wrap gap-3"
                  value={formData.ratings[category]}
                  onValueChange={(value) => setFormData({
                    ...formData, 
                    ratings: {...formData.ratings, [category]: value}
                  })}
                >
                  {options.map((opt) => (
                    <ToggleGroupItem
                      key={opt.label}
                      value={opt.label.toLowerCase()}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-xl ${opt.color} transition-all duration-200 hover:scale-105 data-[state=on]:scale-110`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            ))}
          </div>

          {/* Comments Section */}
          <div className="mt-10 space-y-2">
            <Label className="text-gray-700">Additional Comments</Label>
            <Textarea
              placeholder="Share your thoughts with us..."
              rows={4}
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              className="bg-white/50 border-gray-200 focus:border-red-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-10 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg rounded-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
