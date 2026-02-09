"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Coins, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface MetalRate {
  metalType: string;
  rate: number;
  productCount: number;
}

export function MetalPriceManagement() {
  const { toast } = useToast();
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [newRates, setNewRates] = useState<Record<string, string>>({});

  const fetchMetalRates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/metal-prices", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Unable to load metal prices");
      }
      const data = await response.json();
      setMetalRates(data.metalRates || []);
      
      // Initialize newRates with current rates
      const initialRates: Record<string, string> = {};
      (data.metalRates || []).forEach((mr: MetalRate) => {
        initialRates[mr.metalType] = mr.rate.toString();
      });
      setNewRates(initialRates);
    } catch (error) {
      console.error("[v0] Metal prices fetch failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load metal prices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMetalRates();
  }, [fetchMetalRates]);

  // SSE connection for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const setupSSE = () => {
      try {
        eventSource = new EventSource('/api/admin/metal-prices/events');

        eventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'metal_price_updated') {
              const { metalType, newRate, updatedCount } = message.data;
              
              // Show notification
              toast({
                title: "Price Updated",
                description: `${metalType} rate updated to ₹${newRate.toLocaleString('en-IN')}/gram. ${updatedCount} products updated.`,
                variant: "success",
              });

              // Refresh metal rates to get updated data
              fetchMetalRates();
            } else if (message.type === 'connected') {
              console.log('[SSE] Connected to metal price updates');
            }
          } catch (error) {
            console.error('[SSE] Error parsing message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('[SSE] Connection error:', error);
          // Reconnect after 3 seconds
          if (eventSource) {
            eventSource.close();
          }
          setTimeout(setupSSE, 3000);
        };
      } catch (error) {
        console.error('[SSE] Failed to setup SSE:', error);
      }
    };

    setupSSE();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [toast, fetchMetalRates]);

  const handleUpdateRate = async (metalType: string) => {
    const newRateStr = newRates[metalType];
    if (!newRateStr) {
      toast({
        title: "Error",
        description: "Please enter a valid rate",
        variant: "destructive",
      });
      return;
    }

    const newRate = parseFloat(newRateStr);
    if (isNaN(newRate) || newRate <= 0) {
      toast({
        title: "Error",
        description: "Rate must be a positive number",
        variant: "destructive",
      });
      return;
    }

    setUpdating((prev) => ({ ...prev, [metalType]: true }));
    try {
      const response = await fetch("/api/admin/metal-prices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metalType,
          newRate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to update metal price");
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message || `Updated ${metalType} rate successfully`,
        variant: "success",
      });

      // Refresh metal rates - update the list but preserve the new rate we just set
      const refreshResponse = await fetch("/api/admin/metal-prices", {
        cache: "no-store",
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const updatedMetalRates = refreshData.metalRates || [];
        setMetalRates(updatedMetalRates);
        
        // Update newRates: use the new rate we just set for this metal, and refreshed rates for others
        setNewRates((prev) => {
          const updated: Record<string, string> = { ...prev };
          // Update with refreshed rates for all metals
          updatedMetalRates.forEach((mr: MetalRate) => {
            // If this is the metal we just updated, keep our new value, otherwise use refreshed rate
            if (mr.metalType === metalType) {
              updated[mr.metalType] = newRateStr; // Keep the value we just updated
            } else {
              updated[mr.metalType] = mr.rate.toString();
            }
          });
          return updated;
        });
      } else {
        // If refresh fails, still update the metalRates with the new rate locally
        setMetalRates((prev) => 
          prev.map((mr) => 
            mr.metalType === metalType 
              ? { ...mr, rate: newRate } 
              : mr
          )
        );
      }
    } catch (error) {
      console.error("[v0] Metal price update failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update metal price",
        variant: "destructive",
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [metalType]: false }));
    }
  };

  if (loading) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/20">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Metal Price Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage live metal prices and update product prices automatically.
          </p>
        </div>
        <div className="px-6 py-6 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading metal prices...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (metalRates.length === 0) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/20">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Metal Price Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage live metal prices and update product prices automatically.
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <AlertCircle className="h-5 w-5" />
            <span>No metal prices found. Add products with metal types to see them here.</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/20">
        <div className="flex items-center gap-3">
          <Coins className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Metal Price Management
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Update live metal prices. All products using these metals will be automatically recalculated.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {metalRates.map((metalRate) => (
          <div
            key={metalRate.metalType}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label className="text-base font-semibold text-slate-900 dark:text-white">
                  {metalRate.metalType}
                </Label>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {metalRate.productCount} product{metalRate.productCount !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Current rate: ₹{metalRate.rate.toLocaleString('en-IN')} per gram
              </p>
            </div>
            <div className="flex items-center gap-3 sm:flex-row">
              <div className="flex-1 sm:flex-initial">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newRates[metalRate.metalType] ?? metalRate.rate.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewRates((prev) => ({
                      ...prev,
                      [metalRate.metalType]: value,
                    }));
                  }}
                  placeholder="New rate"
                  className="h-10 w-full sm:w-40"
                />
              </div>
              <Button
                onClick={() => handleUpdateRate(metalRate.metalType)}
                disabled={updating[metalRate.metalType] || newRates[metalRate.metalType] === metalRate.rate.toString()}
                className="gap-2"
              >
                {updating[metalRate.metalType] ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">Important:</p>
              <p>
                When you update a metal price, all products using that metal type will have their prices automatically recalculated. 
                This action cannot be undone. Make sure the new rate is correct before updating.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
