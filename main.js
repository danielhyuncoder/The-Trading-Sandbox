const loc_str = window.location.toString();
const info=loc_str.split('?')[1].split("&");
const START_INVESTMENT = parseFloat(info[0].split('=')[1]);
let PAUSE = false;
let current_cash = START_INVESTMENT;
let current_price = parseFloat(info[1].split('=')[1]);
const volatility = parseFloat(info[2].split('=')[1]);
const time_bar = parseFloat(info[3].split('=')[1]);

const chartOptions = { layout: { textColor: 'white', background: { type: 'solid', color: '#282B2A' } } };
const chart = LightweightCharts.createChart(document.getElementById('chart'), chartOptions);
const price_label=document.querySelector(".price_label");
const pause_btn=document.querySelector(".pause_btn");
const long_btn = document.querySelector(".long-btn");
const short_btn = document.querySelector(".short-btn");
const current_cash_label = document.querySelector('.current_cash_label');
const candlestickSeries = chart.addCandlestickSeries({
    upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
    wickUpColor: '#26a69a', wickDownColor: '#ef5350',
});
let CURRENT_PERP = true;

// MAIN VARIABLES
let amount_in_contract=0;
let take_profit = 0;
let stop_loss = 0;
let leverage = 1;
const getAmount = document.querySelector(".getamount")
const getTakeProfit = document.querySelector(".gettakeprofit")
const getStoploss = document.querySelector(".getstoploss")
const getLeverage = document.querySelector(".getleverage")
const liquidation_label = document.querySelector(".liquidation_price");
const amount_label = document.querySelector(".full_amt_label");
const enter_trade = document.querySelector(".enter_trade");
const open_trades=document.querySelector('.open_trades');
const end_sim_btn = document.querySelector('.end_sim')
let current_trade_id=1;
let open, high, low, close;
// Bar Data
const barData = [];
let lastClose = current_price;
let close_price_fluctuation;
let main_interval;
let current_open_trades=[];
current_cash_label.innerText="Current Cash: $"+current_cash.toFixed(2); 
price_label.innerText="$"+current_price.toString();
// Primary Functions

const create_long_entry = (c, stop, entry, take, liquidation, trade_id) => {
    const entry_line = c.createPriceLine({
       price: entry,
       color: 'blue', 
       lineWidth: 2,
       title: 'Long Entry (' + trade_id + ')',
       lineStyle: LightweightCharts.LineStyle.Solid
    });
    const stop_loss = c.createPriceLine({
        price: stop,
        color: '#d32f2f', 
        lineWidth: 2,
        title: 'Stop Loss (' + trade_id + ')',
        lineStyle: LightweightCharts.LineStyle.Solid
      });   
      const take_profit = c.createPriceLine({
        price: take,
        color: '#26a69a', 
        lineWidth: 2,
        title: 'Take Profit (' + trade_id + ')',
        lineStyle: LightweightCharts.LineStyle.Solid
      });  
    const liquidation_area = c.createPriceLine({
        price: liquidation,
        color: 'purple', 
        lineWidth: 2,
        title: 'Liquidation (' + trade_id + ')',
        lineStyle: LightweightCharts.LineStyle.Solid
      });  
    return [entry_line, stop_loss, take_profit,liquidation_area];
}
const create_short_entry = (c, stop, entry, take, liquidation, trade_id) => {
    const entry_line = c.createPriceLine({
       price: entry,
       color: 'blue', 
       lineWidth: 2,
       title: 'Short Entry (' + trade_id + ')',
       lineStyle: LightweightCharts.LineStyle.Solid
    });
    const stop_loss = c.createPriceLine({
        price: stop,
        color: '#d32f2f', 
        lineWidth: 2,
        title: 'Stop Loss (' + trade_id + ')',
        lineStyle: LightweightCharts.LineStyle.Solid
      });   
      const take_profit = c.createPriceLine({
        price: take,
        color: '#26a69a', 
        lineWidth: 2,
        title: 'Take Profit (' + trade_id + ')',
        lineStyle: LightweightCharts.LineStyle.Solid
      }); 
    
    const liquidation_area = c.createPriceLine({
        price: liquidation,
        color: 'purple', 
        lineWidth: 2,
        title: 'Liquidation (' + trade_id + ')',
        lineStyle: LightweightCharts.LineStyle.Solid
      });  
    return [entry_line, stop_loss, take_profit,liquidation_area];
}
const remove_long_entry = (c, long_entry) => {
    c.removePriceLine(long_entry[0]);
    c.removePriceLine(long_entry[1]);
    c.removePriceLine(long_entry[2]);
    c.removePriceLine(long_entry[3]);
}
function add_long_trade(stop, take, trade_id, visual){
    const par_element = document.createElement("div");
    par_element.setAttribute("class", "trade");
    const m_element=document.createElement("div");
    const b_element=document.createElement('b');
    const b_at=document.createElement('p');
    const t_id=document.createElement('p');
    const amount_of=document.createElement('p');
    const stop_loss=document.createElement('p');
    const t_profit=document.createElement('p');
    const end=document.createElement('button');

    b_element.setAttribute('class', "g");
    b_element.innerText="Position: Long";
    b_at.innerText="Bought At: $" + current_price.toString();
    t_id.innerText="Trade Id:" + trade_id;
    amount_of.innerText="Number of Contracts: " + amount_in_contract.toString();
    stop_loss.innerText="Stop Loss: $"+stop.toString();
    t_profit.innerText="Take Profit: $"+take.toString();
    end.innerText="End Trade";
    const amt_contract = amount_in_contract;
    const lev = leverage;
    const locked_price=current_price;
    m_element.appendChild(b_element);
    m_element.appendChild(b_at);
    m_element.appendChild(t_id);
    m_element.appendChild(amount_of);
    m_element.appendChild(stop_loss);
    m_element.appendChild(t_profit);
    m_element.appendChild(end);
    end.setAttribute('class', 'end_btn')
    end.addEventListener('click', () => {
        current_cash+=(locked_price+((current_price-locked_price)*amt_contract*Math.max(lev,1)));
        remove_long_entry(candlestickSeries, visual)
        open_trades.removeChild(par_element);
        current_open_trades=current_open_trades.filter(item=>item.current_id!==trade_id)
        current_cash_label.innerText="Current Cash: $"+current_cash.toFixed(2);
    })
    par_element.appendChild(m_element);
    open_trades.appendChild(par_element);
    return par_element;

}
function add_short_trade(stop, take, trade_id, visual){
    const par_element = document.createElement("div");
    par_element.setAttribute("class", "trade");
    const m_element=document.createElement("div");
    const b_element=document.createElement('b');
    const b_at=document.createElement('p');
    const t_id=document.createElement('p');
    const amount_of=document.createElement('p');
    const stop_loss=document.createElement('p');
    const t_profit=document.createElement('p');
    const end=document.createElement('button');
    const amt_contract = amount_in_contract;
    const lev = leverage;
    const locked_price=current_price;
    b_element.setAttribute('class', "r");
    b_element.innerText="Position: Short";
    b_at.innerText="Bought At: $" + current_price.toString();
    t_id.innerText="Trade Id:" + trade_id;
    amount_of.innerText="Number of Contracts: " + amount_in_contract.toString();
    stop_loss.innerText="Stop Loss: $"+stop.toString();
    t_profit.innerText="Take Profit: $"+take.toString();
    end.innerText="End Trade";
    m_element.appendChild(b_element);
    m_element.appendChild(b_at);
    m_element.appendChild(t_id);
    m_element.appendChild(amount_of);
    m_element.appendChild(stop_loss);
    m_element.appendChild(t_profit);
    m_element.appendChild(end);
    end.setAttribute('class', 'end_btn')
    end.addEventListener('click', () => {
        current_cash+=(locked_price+((locked_price-current_price)*amt_contract*Math.max(lev,1)));
        remove_long_entry(candlestickSeries, visual)
        open_trades.removeChild(par_element);
        current_open_trades=current_open_trades.filter(item=>item.current_id!==trade_id)
        current_cash_label.innerText="Current Cash: $"+current_cash.toFixed(2);
    })
    par_element.appendChild(m_element);
    open_trades.appendChild(par_element);
    return par_element;
}
function update_trades(){
    for (let i =0;i<current_open_trades.length;i++){
        if (current_open_trades[i].type==='LONG'){
           if (current_price>=current_open_trades[i].tp||current_price <= current_open_trades[i].sl||current_price<=current_open_trades[i].liquidation){
               current_cash+=(current_open_trades[i].locked_price+((current_price-current_open_trades[i].locked_price)*current_open_trades[i].amt_contract*Math.max(current_open_trades[i].lev,1)));
               remove_long_entry(candlestickSeries, current_open_trades[i].vis);
               open_trades.removeChild(current_open_trades[i].element);
               current_open_trades=current_open_trades.slice(0, i).concat(current_open_trades.slice(i+1));
               current_cash_label.innerText="Current Cash: $"+current_cash.toFixed(2);
           }
        } else {
           if (current_price<=current_open_trades[i].tp||current_price >= current_open_trades[i].sl||current_price>=current_open_trades[i].liquidation){
               current_cash+=(current_open_trades[i].locked_price+((current_open_trades[i].locked_price-current_price)*current_open_trades[i].amt_contract*Math.max(current_open_trades[i].lev,1)));
               remove_long_entry(candlestickSeries, current_open_trades[i].vis)
               open_trades.removeChild(current_open_trades[i].element);
               current_open_trades=current_open_trades.slice(0, i).concat(current_open_trades.slice(i+1));
               current_cash_label.innerText="Current Cash: $"+current_cash.toFixed(2);
           }
        }
   }
}
function setMainInterval(){
    main_interval=setInterval(()=>{
        open = lastClose;
        high = open + (lastClose*(Math.random() * volatility));
        low = open - (lastClose*(Math.random() * volatility)); 
        close = low + (Math.random() * (high - low)); 
        let currLow=close.toFixed(2);
        let currHigh=close.toFixed(2);
        let curr_date = new Date();
        curr_date.setDate(curr_date.getDate() + barData.length);
        current_price=Math.max(close, 0);
        update_trades();
        barData.push({time: curr_date.getFullYear().toString()+"-"+(curr_date.getMonth()+1).toString()+"-"+curr_date.getDate().toString(), open: open, high: currHigh, low: currLow, close: close.toFixed(2)});
        candlestickSeries.setData(barData);
    }, time_bar*1000);
    close_price_fluctuation = setInterval(() => {
        const o = lastClose;
        const h = o + (lastClose*(Math.random() * (volatility/5)));
        const l = o - (lastClose*(Math.random() * (volatility/5))); 
        const c = l + (Math.random() * (h - l)); 
        barData[barData.length-1].close=c.toFixed(2);
        barData[barData.length-1].high=Math.max(barData[barData.length-1].high, c);
        barData[barData.length-1].low=Math.min(barData[barData.length-1].low, c);
        current_price=Math.max(0, c);
        amount_label.innerText="Full Amount: " + Math.max(0,(amount_in_contract*current_price)).toFixed(2);
        price_label.innerText="$"+current_price.toFixed(2);
        update_trades();
        lastClose = c;
        candlestickSeries.setData(barData);
        
        if (CURRENT_PERP){
           liquidation_label.innerText="Liquidation Price: " + (current_price*(1-(1/leverage))).toFixed(2);
        } else {
           liquidation_label.innerText="Liquidation Price: " + (current_price*(1+(1/leverage))).toFixed(2);
        }
    }, time_bar*100);
}
// Form Functions
getAmount.addEventListener("change", (e)=>{
    amount_in_contract=e.target.value;
    amount_label.innerText="Full Amount: " + Math.max(0,(amount_in_contract*current_price)).toFixed(2);
})
getTakeProfit.addEventListener("change", (e)=>{
    take_profit=e.target.value;
})
getStoploss.addEventListener("change", (e)=>{
    stop_loss=e.target.value;
})
getLeverage.addEventListener("change", (e)=>{
    leverage=Math.max(e.target.value,1);
    if (CURRENT_PERP){
        liquidation_label.innerText="Liquidation Price: " + (current_price*(1-(1/leverage))).toFixed(2);
    } else {
        liquidation_label.innerText="Liquidation Price: " + (current_price*(1+(1/leverage))).toFixed(2);
    }
});
enter_trade.addEventListener("click", () => {
    if (amount_in_contract<=0||take_profit<=0||stop_loss<=0||leverage<=0) {
        alert('All fields must be filled before entering a trade!');
        return;
    }
    if (current_cash < (amount_in_contract*current_price)) {
        alert("Cannot afford contract.");return;
    }
    if (CURRENT_PERP){
        if (stop_loss<=(current_price*(1-(1/leverage)))){
            alert("Cannot have stop loss less than or equal to the liquidation price.");
            return;
        }
        if (stop_loss>=current_price){
            alert("Cannot have stop loss greater than or equal to the current price.");
            return;
        }
        current_cash-=(amount_in_contract*current_price);
        const vis =  create_long_entry(candlestickSeries, stop_loss, current_price, take_profit, (current_price*(1-(1/leverage))), current_trade_id.toString());
        const lt = add_long_trade(stop_loss, take_profit, current_trade_id.toString(), vis);
        current_open_trades.push({type: "LONG", vis: vis, locked_price: current_price, amt_contract: amount_in_contract, lev: leverage, current_id: current_trade_id, element: lt, tp: take_profit, sl: stop_loss, liquidation: current_price*(1-(1/leverage))});
    } else {
        if (stop_loss>=(current_price*(1+(1/leverage)))){
            alert("Cannot have stop loss greater than or equal to the liquidation price.");
            return;
        }
        if (stop_loss<=current_price){
            alert("Cannot have stop loss less than or equal to the current price.");
            return;
        }
        current_cash-=(amount_in_contract*current_price);
        const vis = create_short_entry(candlestickSeries, stop_loss, current_price, take_profit,(current_price*(1+(1/leverage))), current_trade_id.toString());
        const st = add_short_trade(stop_loss, take_profit, current_trade_id.toString(), vis);
        current_open_trades.push({type: "SHORT", locked_price: current_price, amt_contract: amount_in_contract, lev: leverage, vis: vis, current_id: current_trade_id, element: st, tp: take_profit, sl: stop_loss, liquidation: current_price*(1+(1/leverage))});
    }
    current_trade_id++;

    

})
long_btn.addEventListener("click", () => {
    CURRENT_PERP=true;
    short_btn.setAttribute("class", "short-btn btn-disabled");
    long_btn.setAttribute("class", "long-btn");
    leverage=Math.max(leverage,1);
    liquidation_label.innerText="Liquidation Price: " + (current_price*(1-(1/leverage))).toFixed(2);
})
short_btn.addEventListener("click", () => {
    CURRENT_PERP=false;
    long_btn.setAttribute("class", "long-btn btn-disabled");
    short_btn.setAttribute("class", "short-btn");
    leverage=Math.max(leverage,1);
    liquidation_label.innerText="Liquidation Price: " + (current_price*(1+(1/leverage))).toFixed(2);
})
pause_btn.addEventListener("click", () => {
    if (!PAUSE){
       pause_btn.setAttribute("class", "pause_btn pause_btn_play")
       pause_btn.innerText="Play";
       clearInterval(main_interval);
       clearInterval(close_price_fluctuation);
    } else {
       pause_btn.setAttribute("class", "pause_btn pause_btn_paused")
       pause_btn.innerText="Pause";
       setMainInterval();
    }
    PAUSE=!PAUSE;
});
end_sim_btn.addEventListener("click", () => {
    window.location.replace("dashboard.html")
})

// Start Functions
setMainInterval();
chart.timeScale().fitContent();