module.exports = class Onu{
    constructor(data)
        {
            this.onuIndex = data._onuIndex;
            this.slot = data.slot;
            this.pon = data.pon;
            this.onuId = data.onuId;
            this.macAddress = data.macAddress;
            this.onuStatusValue = data.onuStatusValue;
            this.onuStatus = this.onuStatus;
        }

        onuChangedStatus(onuStatusValue){
            if(onuStatusValue != this.onuStatusValue){
                this.onuStatusValue = onuStatusValue;
                return true;
            }
            return false;
        }
    
}