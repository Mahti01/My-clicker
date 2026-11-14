export class Economy{
  constructor(state){this.state=state;}
  get money(){return this.state.get().money;}
  canAfford(amount){return this.money>=amount;}
  spend(amount){return this.state.spendMoney(amount);}
  earn(amount){return this.state.addMoney(amount);}
  addExperience(amount){return this.state.addExperience(amount);}
}
