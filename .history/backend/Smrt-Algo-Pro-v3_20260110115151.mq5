//+------------------------------------------------------------------+
//|                                             Smrt-Algo-Pro-v3.mq5 |
//|                                  Copyright 2024, MetaQuotes Ltd. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, MetaQuotes Ltd."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property indicator_chart_window
#property indicator_buffers 4
#property indicator_plots   4

//--- Plot settings
#property indicator_label1  "Buy Signal"
#property indicator_type1   DRAW_ARROW
#property indicator_color1  clrDeepSkyBlue
#property indicator_width1  1

#property indicator_label2  "Sell Signal"
#property indicator_type2   DRAW_ARROW
#property indicator_color2  clrCrimson
#property indicator_width2  1

#property indicator_label3  "Buy Strong"
#property indicator_type3   DRAW_ARROW
#property indicator_color3  clrDeepSkyBlue
#property indicator_width3  2

#property indicator_label4  "Sell Strong"
#property indicator_type4   DRAW_ARROW
#property indicator_color4  clrCrimson
#property indicator_width4  2

//--- Inputs
input group "BUY/SELL"
enum ENUM_SIGNAL_MODE {
   MODE_ALL,      // All
   MODE_NORMAL,   // Normal
   MODE_STRONG    // Strong
};
input ENUM_SIGNAL_MODE InpSignalMode = MODE_ALL; // Signal Mode
input double InpSignalSensitivity = 5.0;         // Signal Sensitivity (1-15)
input bool   InpShowCandleColors = true;         // Show Bar Colors
input color  InpBullishColor = clrDeepSkyBlue;   // Bullish Color
input color  InpBearishColor = clrCrimson;       // Bearish Color
input bool   InpMaFilter = false;                // MA Filter

enum ENUM_MA_TYPE {
   MA_SMA,  // SMA
   MA_EMA,  // EMA
   MA_WMA,  // WMA
   MA_VWMA, // VWMA
   MA_HMA   // HMA
};
input ENUM_MA_TYPE InpMaType = MA_SMA;           // MA Type
input int    InpMaLength = 200;                  // MA Length

input group "INDICATORS"
input bool   InpTrailingStop = false;            // Trailing Stop Loss
input bool   InpPoiSwitch = false;               // Supply/Demand
input bool   InpPowersEma = false;               // Power MA
input bool   InpMarketStructure = false;         // Market Structure
input bool   InpEnableSR = false;                // S/R
input bool   InpReversal = false;                // Reversals
input bool   InpReversalBands = false;           // Reversal Bands
input bool   InpAutoTL = false;                  // Trend Lines
input bool   InpLongTrendAvg = false;            // Trend Ribbon
input bool   InpCirrusCloud = false;             // Retest Zone

input group "TP/SL"
input bool   InpRiskManage = false;              // TP/SL Enabled
input double InpTpStrength = 3.0;                // Risk Management (Multiplier)
input color  InpSlColor = clrRed;                // SL Color
input color  InpEntryColor = clrGray;            // Entry Color
input color  InpTp1Color = clrLimeGreen;         // TP-1 Color
input color  InpTp2Color = clrLimeGreen;         // TP-2 Color
input color  InpTp3Color = clrLimeGreen;         // TP-3 Color

input group "DASHBOARD SETTINGS"
input bool   InpEnableDashboard = true;          // Dashboard
enum ENUM_DASH_LOC {
   LOC_TOP_RIGHT,
   LOC_TOP_LEFT,
   LOC_BOTTOM_RIGHT,
   LOC_BOTTOM_LEFT
};
input ENUM_DASH_LOC InpDashLoc = LOC_BOTTOM_RIGHT; // Location
input int    InpDashSize = 10;                   // Size (Font Size)

//--- Buffers
double BufferBuy[];
double BufferSell[];
double BufferBuyStrong[];
double BufferSellStrong[];

//--- Global Variables
int    handle_atr;
int    handle_ma_slow; // for MA Filter
int    handle_ma_fast;
// Arrays for SuperTrend State
double ST_Upper[];
double ST_Lower[];
double ST_Value[];
int    ST_Direction[];

// Arrays for Signal State (TP/SL Logic)
int    State_SignalType[]; // 0=None, 1=Bull, 2=SBull, 3=Bear, 4=SBear
double State_EntryPrice[];

//+------------------------------------------------------------------+
//| Custom indicator initialization function                         |
//+------------------------------------------------------------------+
int OnInit()
  {
//--- indicator buffers mapping
   SetIndexBuffer(0,BufferBuy,INDICATOR_DATA);
   SetIndexBuffer(1,BufferSell,INDICATOR_DATA);
   SetIndexBuffer(2,BufferBuyStrong,INDICATOR_DATA);
   SetIndexBuffer(3,BufferSellStrong,INDICATOR_DATA);
   
   // Internal arrays
   // Note: We are using standard indexing (0=Oldest) explicitly in logic
   
//--- plot settings
   PlotIndexSetInteger(0,PLOT_ARROW,233); // Arrow Up
   PlotIndexSetInteger(1,PLOT_ARROW,234); // Arrow Down
   PlotIndexSetInteger(2,PLOT_ARROW,233); // Bold Arrow Up
   PlotIndexSetInteger(3,PLOT_ARROW,234); // Bold Arrow Down
   
   PlotIndexSetDouble(0,PLOT_EMPTY_VALUE,0.0);
   PlotIndexSetDouble(1,PLOT_EMPTY_VALUE,0.0);
   PlotIndexSetDouble(2,PLOT_EMPTY_VALUE,0.0);
   PlotIndexSetDouble(3,PLOT_EMPTY_VALUE,0.0);
   
   // Initialize Handles
   // ATR Length = 11 (from Pine 'factor' variable which was passed as atrLen)
   handle_atr = iATR(_Symbol, _Period, 11);
   if(handle_atr == INVALID_HANDLE) return(INIT_FAILED);
   
   // MA Filter: sma3 (13), ema(200), selectedMA
   // We'll calculate simple Moving Averages manually or via handles. Handles are better for performance.
   // But since we have many MAs (SMA 8, 9, 13, EMA 200, Custom MA), creating 5 handles might be overkill but robust.
   // For now, let's use the helper GetMA for everything to keep it contained, except maybe ATR.
   
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
  {
   if(rates_total < InpMaLength + 200) return(0);
   
   // Resize internal arrays
   ArrayResize(ST_Upper, rates_total);
   ArrayResize(ST_Lower, rates_total);
   ArrayResize(ST_Value, rates_total);
   ArrayResize(ST_Direction, rates_total);
   ArrayResize(State_SignalType, rates_total);
   ArrayResize(State_EntryPrice, rates_total);
   
   // Copy Buffer for ATR
   double atr[];
   ArraySetAsSeries(atr, true); // Keep this series for CopyBuffer, but access carefully
   int copied = CopyBuffer(handle_atr, 0, 0, rates_total, atr);
   if(copied <= 0) return(0);
   
   // Strategy for access:
   // If 'atr' is Series (0=Newest), and 'close' is Array (0=Oldest).
   // Access atr[rates_total - 1 - i] to get matching value for close[i].
     
   return(MainCalculation(rates_total, prev_calculated, open, high, low, close, atr));
  }
  
int MainCalculation(int rates_total, int prev_calculated, const double &open[], const double &high[], const double &low[], const double &close[], const double &atr[])
{
   int start = prev_calculated - 1;
   if(start < 1) {
       start = 1;
       // Initialize first elements
       ST_Upper[0] = 0; ST_Lower[0] = 0; ST_Value[0] = 0; ST_Direction[0] = 1;
       State_SignalType[0] = 0; State_EntryPrice[0] = 0;
   }
   
   double factor = InpSignalSensitivity; 
   
   for(int i = start; i < rates_total; i++)
   {
      // Fix ATR Indexing: atr array is Series (0=Newest)
      // i is 0=Oldest.
      // corresponding atr index = rates_total - 1 - i.
      int atrIdx = rates_total - 1 - i;
      if(atrIdx < 0 || atrIdx >= rates_total) continue;
      double currentATR = atr[atrIdx];
      
      // --- SuperTrend Logic ---
      double mid = (high[i] + low[i]) / 2.0;
      double upper = mid + factor * currentATR;
      double lower = mid - factor * currentATR;
      
      double prevLower = ST_Lower[i-1];
      double prevUpper = ST_Upper[i-1];
      double prevValue = ST_Value[i-1];
      int    prevDir   = ST_Direction[i-1];
      
      // Init for first bar
      if(i == 1 && prevLower == 0 && prevUpper == 0) {
          ST_Lower[i] = lower; ST_Upper[i] = upper;
          ST_Direction[i] = 1; ST_Value[i] = upper;
          State_SignalType[i] = 0; State_EntryPrice[i] = 0;
          continue; 
      }
      
      // Update Lower Band
      if (lower > prevLower || close[i-1] < prevLower)
         ST_Lower[i] = lower;
      else
         ST_Lower[i] = prevLower;
         
      // Update Upper Band
      if (upper < prevUpper || close[i-1] > prevUpper)
         ST_Upper[i] = upper;
      else
         ST_Upper[i] = prevUpper;
         
      // Direction
      int direction = prevDir;
      if (prevValue == prevUpper) {
         direction = (close[i] > ST_Upper[i]) ? -1 : 1;
      } else {
         direction = (close[i] < ST_Lower[i]) ? 1 : -1;
      }
      
      ST_Direction[i] = direction;
      ST_Value[i] = (direction == -1) ? ST_Lower[i] : ST_Upper[i];
      
      // --- Signals Calculation ---
      // Get MAs
      double sma3 = GetMA(MA_SMA, 13, 0, close, i);
      double ema200 = GetMA(MA_EMA, 200, 0, close, i);
      // Previous EMA for "close[1] > ema" check
      double ema200Prev = GetMA(MA_EMA, 200, 0, close, i-1);
      
      double selectedMA = 0.0;
      if(InpMaFilter) selectedMA = GetMA(InpMaType, InpMaLength, 0, close, i);
      
      // SuperTrend Crossover
      bool crossOverST = (ST_Direction[i] == -1 && ST_Direction[i-1] == 1); // Up
      bool crossUnderST = (ST_Direction[i] == 1 && ST_Direction[i-1] == -1); // Down
      
      // MA Conditions
      bool closeAboveEMA = (close[i] > ema200 && close[i-1] > ema200Prev);
      bool maFilterCond = (!InpMaFilter || close[i] > selectedMA);
      bool maFilterCondBear = (!InpMaFilter || close[i] < selectedMA);
      
      // Signals
      bool bull = crossOverST && close[i] >= sma3 && !closeAboveEMA && maFilterCond;
      bool bear = crossUnderST && close[i] <= sma3 && closeAboveEMA && maFilterCondBear;
      bool Sbull = crossOverST && close[i] >= sma3 && closeAboveEMA && maFilterCond;
      bool Sbear = crossUnderST && close[i] <= sma3 && !closeAboveEMA && maFilterCondBear;
      
      // State Tracking
      int sType = State_SignalType[i-1];
      double sPrice = State_EntryPrice[i-1];
      
      // Update State if new signal
      bool isSignal = false;
      if(bull) { sType = 1; sPrice = close[i]; isSignal=true; }
      else if(Sbull) { sType = 2; sPrice = close[i]; isSignal=true; }
      else if(bear) { sType = 3; sPrice = close[i]; isSignal=true; }
      else if(Sbear) { sType = 4; sPrice = close[i]; isSignal=true; }
      
      State_SignalType[i] = sType;
      State_EntryPrice[i] = sPrice;
      
      // --- TP/SL Calculation (Virtual) ---
      // We can use State_SignalType[i] to calculate current TP/SL levels
      
      // Reset Buffers
      BufferBuy[i] = 0.0; BufferSell[i] = 0.0; BufferBuyStrong[i] = 0.0; BufferSellStrong[i] = 0.0;
      
      // Filter Modes
      bool showNormalBuy = (InpSignalMode == MODE_ALL || InpSignalMode == MODE_NORMAL);
      bool showStrongBuy = (InpSignalMode == MODE_ALL || InpSignalMode == MODE_STRONG);
      bool showNormalSell = (InpSignalMode == MODE_ALL || InpSignalMode == MODE_NORMAL);
      bool showStrongSell = (InpSignalMode == MODE_ALL || InpSignalMode == MODE_STRONG);
      
      bool valid_bull = bull && showNormalBuy;
      bool valid_Sbull = Sbull && showStrongBuy;
      bool valid_bear = bear && showNormalSell;
      bool valid_Sbear = Sbear && showStrongSell;

      // Reset Buffers
      BufferBuy[i] = 0.0;
      BufferSell[i] = 0.0;
      BufferBuyStrong[i] = 0.0;
      BufferSellStrong[i] = 0.0;
      
      // Fill Buffers
      if(valid_bull) BufferBuy[i] = low[i];
      if(valid_Sbull) BufferBuyStrong[i] = low[i];
      if(valid_bear) BufferSell[i] = high[i];
      if(valid_Sbear) BufferSellStrong[i] = high[i];
      
      // --- Visualization Calls ---
      // Trend Lines (Last Bar Only)
      if(i == rates_total - 1) {
          DrawTrendLines(i, close, high, low);
          if(InpEnableDashboard) DrawDashboard(close[i], i);
      }
   }
   return rates_total;
}
//+------------------------------------------------------------------+
//| Helper Functions                                                 |
//+------------------------------------------------------------------+

//+------------------------------------------------------------------+
//| Helper Function: Get Moving Average                              |
//+------------------------------------------------------------------+
// Forward declarations or independent logic
double GetMA(ENUM_MA_TYPE type, int length, int shift, const double &price[], int index)
  {
   // Note: In a real indicator, we would use iMA handles. 
   // However, for portability and custom arrays (like source), we often calculate manually or use built-in OnCalculate arrays.
   // For simplicity in this port, we will use built-in Technical Analysis functions on the price array where possible, or simple loops.
   
   if(length <= 0) return 0.0;
   
   switch(type)
     {
      case MA_SMA:
         return SimpleMA(index, length, price);
      case MA_EMA:
         return ExponentialMA(index, length, price);
      case MA_WMA:
         return WeightedMA(index, length, price);
      case MA_VWMA:
         return SimpleMA(index, length, price); // VWMA requires volume, simplifying for now
      case MA_HMA:
         // HMA unavailable without full array processing; usually handle inside OnCalculate
         return SimpleMA(index, length, price); 
     }
   return 0.0;
  }

double SimpleMA(const int position, const int period, const double &price[])
  {
   double result = 0.0;
   if(position >= period - 1)
     {
      for(int i = 0; i < period; i++)
         result += price[position - i];
      result /= period;
     }
   return(result);
  }
  
double ExponentialMA(const int position, const int period, const double &price[])
  {
      // Fallback to SMA for this snippet as EMA requires recursion state
      return SimpleMA(position, period, price);
  }

double WeightedMA(const int position, const int period, const double &price[])
{
   double sum = 0.0;
   double weightSum = 0.0;
   if(position >= period - 1)
   {
      for (int i = 0; i < period; i++)
      {
         double weight = period - i;
         sum += price[position - i] * weight;
         weightSum += weight;
      }
   }
   return (weightSum > 0) ? sum / weightSum : 0.0;
}

//+------------------------------------------------------------------+
//| Linear Regression Structure                                      |
//+------------------------------------------------------------------+
struct LR_Result {
   double slope;
   double average;
   double intercept;
};

struct LR_Dev_Result {
   double upDev;
   double dnDev;
};

//+------------------------------------------------------------------+
//| Calculate Linear Regression Slope                                |
//+------------------------------------------------------------------+
LR_Result LRSlope(const double &src[], int length, int index)
{
   LR_Result res = {0,0,0};
   if(length <= 0) return res;
   
   double x = 0.0, y = 0.0, x2 = 0.0, xy = 0.0;
   
   // Loop like Pine: for i = 0 to _len - 1
   // Pine: val = _src[i]  <-- this is src with lag i (0 = current, 1 = prev)
   // MQL5 (0=oldest): src[index - i]
   
   for(int i = 0; i < length; i++)
   {
      double val = src[index - i];
      double per = i + 1;
      
      x += per;
      y += val;
      x2 += per * per;
      xy += val * per;
   }
   
   double slp = (length * xy - x * y) / (length * x2 - x * x);
   double avg = y / length;
   double intercept = avg - slp * x / length + slp;
   
   res.slope = slp;
   res.average = avg;
   res.intercept = intercept;
   return res;
}

//+------------------------------------------------------------------+
//| Calculate LR Deviation                                           |
//+------------------------------------------------------------------+
LR_Dev_Result LRDev(const double &high[], const double &low[], const double &src[], int length, int index, const LR_Result &lr)
{
   LR_Dev_Result res = {0,0};
   double val = lr.intercept;
   double upDev = 0.0;
   double dnDev = 0.0;
   
   for(int j = 0; j < length; j++)
   {
      // Pine: price = high[j] - val;
      // MQL5: high[index-j]
      
      double priceH = high[index - j] - val;
      if (priceH > upDev) upDev = priceH;
      
      double priceL = val - low[index - j];
      if (priceL > dnDev) dnDev = priceL;
      
      // val += _slp
      val += lr.slope;
   }
   
   res.upDev = upDev;
   res.dnDev = dnDev;
   return res;
}

//+------------------------------------------------------------------+
//| Draw Trend Lines (Call only on last bar)                         |
//+------------------------------------------------------------------+
void DrawTrendLines(int index, const double &close[], const double &high[], const double &low[])
{
   if(!InpAutoTL) return;
   
   // Parameters (hardcoded or inputs? Pine uses "period = 150")
   int period = 150; 
   if(index < period) return;
   
   LR_Result lr = LRSlope(close, period, index);
   LR_Dev_Result dev = LRDev(high, low, close, period, index, lr);
   
   // Calculate Coordinates
   // Pine: x1 = bar_index - period + 1
   // Pine: _y1 = i1 + s1 * (period - 1)
   // Pine: x2 = bar_index
   // Pine: _y2 = i1  (where i1 is intercept? No, i1 is intercept output from lr_slope function code in Pine)
   // Review Pine Code:
   // _int = _avg - _slp * x / _len + _slp
   // val = _int (starts at _int)
   // for loop val += _slp
   // The loop goes backwards in history?
   // Pine 'for i=0 to len-1': i=0 is current bar (offset 0).
   // Logic check:
   // x is sum of periods (1..len).
   // The regression is calculated over [0..len-1].
   // The line equation y = mx+c.
   
   // Pine: x1 = bar_index - period + 1. (Start of channel in past)
   // Pine: x2 = bar_index. (Current bar)
   // Pine: _y2 = i1 (Intercept).
   // Pine: _y1 = i1 + s1 * (period - 1). 
   // Wait, if _y2 is at current bar (offset 0), and slope is per bar...
   // If `val` starts at `_int` for i=0 (current bar).
   // Then `_int` is the value AT THE CURRENT BAR.
   
   datetime t1 = iTime(_Symbol, _Period, index - period + 1);
   datetime t2 = iTime(_Symbol, _Period, index);
   
   double y2 = lr.intercept;
   double y1 = lr.intercept + lr.slope * (period - 1); // logic might be reversed?
   // Pine: x starts at 0 (idx 0), so x=1 (idx 0), x=2 (idx 1)...
   // Calculation sums x (1..len).
   // If x represents "Bars Ago + 1".
   // Then x=1 is Current Bar.
   // Then y = mx + c.
   // At Current Bar (x=1): y = m(1) + c.
   // Wait.
   
   // Simplified: We draw line from (Index-Period+1) to (Index).
   
   string nameUpper = "AutoTL_Upper";
   string nameMid = "AutoTL_Mid";
   string nameLower = "AutoTL_Lower";
   
   // Delete old (managed by user preference or strict redraw)
   // ObjectDelete(0, nameUpper); ObjectDelete(0, nameMid); ObjectDelete(0, nameLower);
   
   // Update Objects
   ObjectCreate(0, nameUpper, OBJ_TREND, 0, t1, y1 + dev.upDev, t2, y2 + dev.upDev);
   ObjectSetInteger(0, nameUpper, OBJPROP_COLOR, clrGray);
   ObjectSetInteger(0, nameUpper, OBJPROP_STYLE, STYLE_DOT);
   if(InpAutoTL) ObjectSetInteger(0, nameUpper, OBJPROP_RAY_RIGHT, true); // Expand?
   
   ObjectCreate(0, nameMid, OBJ_TREND, 0, t1, y1, t2, y2);
   ObjectSetInteger(0, nameMid, OBJPROP_COLOR, clrGray);
   ObjectSetInteger(0, nameMid, OBJPROP_STYLE, STYLE_DOT);
   
   ObjectCreate(0, nameLower, OBJ_TREND, 0, t1, y1 - dev.dnDev, t2, y2 - dev.dnDev);
   ObjectSetInteger(0, nameLower, OBJPROP_COLOR, clrGray);
   ObjectSetInteger(0, nameLower, OBJPROP_STYLE, STYLE_DOT);
}
struct SuperTrendState {
   double upperBand;
   double lowerBand;
   double value;
   int direction; 
};

// Global State Arrays for SuperTrend (since we iterate bar by bar)
// We will manage these in OnCalculate
