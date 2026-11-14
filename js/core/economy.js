export class Economy{
  constructor(state){
    this.state=state;
    this.incomeTimer=null;
  }

  get money(){return this.state.get().money;}

  canAfford(amount){return this.money>=amount;}

  spend(amount){return this.state.spendMoney(amount);}

  earn(amount){return this.state.addMoney(amount);}

  addExperience(amount){return this.state.addExperience(amount);}

  getIncomePerMinute(){
    const buildings=this.state.get().world?.buildings||[];
    const rates={house:30,shop:100,office:180,villa:60};
    return buildings.reduce((sum,b)=>sum+(rates[b.type]||0),0);
  }

  getIncomeBreakdown(){
    const buildings=this.state.get().world?.buildings||[];
    const rates={house:30,shop:100,office:180,villa:60};
    const result={house:0,shop:0,office:0,villa:0};
    for(const b of buildings){
      if(result[b.type]!==undefined)result[b.type]+=rates[b.type]||0;
    }
    return result;
  }

  startIncome(){
    if(this.incomeTimer)return;
    this.incomeTimer=setInterval(()=>{
      const perMinute=this.getIncomePerMinute();
      const payout=perMinute/12;
      if(payout>0)this.earn(payout);
      window.dispatchEvent(new CustomEvent("economy:updated",{detail:{incomePerMinute:perMinute}}));
    },5000);
  }
}
