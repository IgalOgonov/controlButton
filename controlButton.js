    //The bridge between each button and its parent
    if(eventHub === undefined)
        var eventHub = new Vue();

    /*This component is responsible for control buttons.
     * Target is the operation target.
     *  
     * property is a string, array, or an object of the type: 
     *      {
     *          'propertyKey':'proeprtyValue',
     *          ...
     *      }
     * of perperties to add/set/remove/toggle/etc.
     * 
     * targetType is the type of target, which can be:
     * 'class' - The class of target (target is a node)
     * 'style' -  The style of target (target is a node)
     * 'object' - target itself (default)
     * 'event'  - Only send events about button presses and let the recievers handle it.
     * 
     * operationType can be 'add','set','remove' and 'toggle'.
     * 'add'    - Will try to add the NOT CURRENTLY EXISTING properties to the 'object' or 'style',
     *            if 'property' is an Object. 
     *            Will try to add proprty to the 'class' if 'proprty' is a string, or array of strings. 
     *            Other cases will be ignored.
     * 'set'    - Will try to set the 'class'/'style' to property, if property is a string.
     *            Will try to set the 'object'/'style's properties the values of 'property' to if it is an Object. 
     *            Other cases will be ignored.
     * 'remove' - Will try to remove 'property' from 'style'/'class'/'object' if it's a string.
     *            Will try to remove all properties by key from 'style'/'class'/'object' if 'property' is an Array.
     * 'toggle' - Will try to toggle the 'class' named in 'property' if 'property' is a string.
     *            Will try to toggle the 'class' that exists in 'property' to the next one in line, if 
     *            'property' is an array.
     *            Will try to toggle the property of the 'object' between true and false if 'property' is a string,
     *            or between false/''/null (depending on proeprtyValue - bool/string/anythingElse) and proeprtyValue
     *            if 'property' is an Object, for each of the propertyKey's. ONLY STRINGS/NUMBERS/BOOLEANS 
     *            can be toggled off.
     *            TODO add 'style' support
     * 
     * targetIsVue should be set to true if the target is a Vue object, and you wish to add/set/remove/toggle 
     * properties reactively.
     * 
     * activeClass sepecifies the name of the class that should be added to the button on toggle
     * 
     * buttonIndex is the index of the button, in case it should be togglable
     * 
     * buttonOn Whether the button is on (whether activeClass should be added)
     * 
     * controllerID is an optional ID you may bind to the button, to identify event sender by an ID
     * 
     */
    Vue.component('controlButton', {
        template: '<button :class="toggleClass" @click="performOperation(operationType)"> {{title}} </button>',
        props:{
            target:{
                validator: function(value){
                    return typeof value === 'object'
                }
              },
            property: [String,Object,Array],
            title:{
                type: String,
                default: ''
              },
            targetType:{
                type: String,
                default: 'object'
              },
            operationType:{
                type: String,
                default: 'toggle'
              },
            targetIsVue: {
                type: Boolean,
                default: false
            },
            buttonIndex: {
                type: Number,
                default: -1
                },
            activeClass: {
                type: String,
                default: ''
                },
            buttonOn: {
                type: Boolean,
                default: false
                },
            controllerID: {
                type: String,
                default: ''
                },
        },
        computed:{
            toggleClass: function(){
                return this.buttonOn ? this.activeClass : '';
            }
        },
        methods:{
            performOperation: function(operationType){
                let properties;
                let targetPropertyIndex;
                switch(this.targetType){
                    case 'object':
                            switch(operationType){

                                case 'set': 
                                    if( typeof this.property !== 'object' || Array.isArray(this.property))
                                        return;
                                    //Set the properties
                                    properties.forEach(function(item,index){
                                        if(this.targetIsVue)
                                            Vue.add(target,index,properties[i]);
                                        else
                                            this.target[index] = item;
                                    });
                                    this.sendEventToHub('set');
                                    break;

                                case 'add': 
                                    if( typeof this.property !== 'object' || Array.isArray(this.property))
                                        return;
                                    //Get all properties to set
                                    properties = JSON.parse(JSON.stringify(this.property));
                                    //Set the properties
                                    properties.forEach(function(item,index){
                                        if(this.target[index] === undefined){
                                            if(this.targetIsVue)
                                                Vue.set(target,index,properties[i]);
                                            else
                                                this.target[index] = item;
                                        }
                                    });
                                    this.sendEventToHub('add');
                                    break;

                                case 'remove': 
                                    //Only strings and arrays allowed
                                    if( typeof this.property !== 'string' && !Array.isArray(this.property))
                                        return;
                                    //
                                    if(typeof this.property === 'string')
                                        properties = [this.property];
                                    else
                                        properties = Array.from(this.property);

                                    for (let i = 0; i< properties.length; i++){
                                            if(this.target[properties[i]] !== undefined){
                                                if(this.targetIsVue)
                                                    Vue.remove(target,properties[i]);
                                                else
                                                    delete target[properties[i]];
                                            }
                                        }
                                    this.sendEventToHub('remove');
                                    break;

                                case 'toggle':
                                    //Do nothing if the property is an array
                                    if(Array.isArray(this.property))
                                        return;
                                    
                                    properties = {};
                                    
                                    //On string, create an object with one key and a value 'true'
                                    if(typeof this.property === 'string')
                                        properties[this.property] = true;
                                    else
                                        properties = JSON.parse(JSON.stringify(this.property));
                                    
                                    properties.forEach(function(item,index){
                                        if(this.target[index] != undefined){
                                            if(
                                                this.target[index] === '' || 
                                                this.target[index] === false || 
                                                this.target[index] === null
                                            ){
                                            if(this.targetIsVue)
                                                Vue.set(target,index,properties[i]);
                                            else
                                                this.target[index] = item;
                                            }
                                            else{
                                                if(typeof item === 'number')
                                                    if(this.targetIsVue)
                                                        Vue.set(target,index,null);
                                                    else
                                                        this.target[index] = null;
                                                else if(typeof item === 'boolean')
                                                    if(this.targetIsVue)
                                                        Vue.set(target,index,false);
                                                    else
                                                        this.target[index] = false;
                                                else if(typeof item === 'string')
                                                    if(this.targetIsVue)
                                                        Vue.set(target,index,'');
                                                    else
                                                        this.target[index] = '';
                                            }
                                        }
                                    });
                                    this.sendEventToHub('toggle');
                                    break;

                            }
                        break;

                    case 'class':
                            switch(operationType){

                                case 'set': 
                                    if(typeof this.property !== 'string')
                                        return;
                                    this.target.className = this.property;
                                    this.sendEventToHub('set');
                                    break;

                                case 'add': 
                                    //If property is a togglable array
                                    if(!Array.isArray(this.property))
                                        properties = [this.property];
                                    else
                                        properties = Array.from(this.property);

                                    //Try to see if the property exists in the class list
                                    targetPropertyIndex = this.locatePropertyInClasslist(properties,this.target);

                                    //If the class list doesn't have the property, do nothing, else remove
                                    if(targetPropertyIndex != -1){
                                        this.target.classList.add(
                                            properties[targetPropertyIndex]
                                            );
                                    }
                                    this.sendEventToHub('add');
                                    break;

                                case 'remove': 
                                    //If property is a togglable array
                                    if(!Array.isArray(this.property))
                                        properties = [this.property];
                                    else
                                        properties = Array.from(this.property);

                                    //Try to see if the property exists in the class list
                                    targetPropertyIndex = this.locatePropertyInClasslist(properties,this.target);

                                    //If the class list doesn't have the property, do nothing, else remove
                                    if(targetPropertyIndex != -1){
                                        this.target.classList.remove(
                                            properties[targetPropertyIndex]
                                            );
                                    }
                                    this.sendEventToHub('remove');
                                    break;

                                case 'toggle': 
                                    //If property is a togglable array
                                    if(Array.isArray(this.property)){
                                        //Try to see if the property exists in the class list
                                        let targetPropertyIndex = this.locatePropertyInClasslist(this.property,this.target);
                                        //If the class list doesn't have the property, do nothing, else toggle 
                                        //the next one
                                        if(targetPropertyIndex != -1){
                                            this.target.classList.replace(
                                                this.property[targetPropertyIndex],
                                                this.property[(targetPropertyIndex+1)%this.property.length]
                                                );
                                        }
                                    }
                                    //If property is a togglable string
                                    else if(typeof this.property === 'string'){

                                        //Try to see if the property exists in the class list
                                        properties = [this.property];
                                        targetPropertyIndex = this.locatePropertyInClasslist(properties,this.target);

                                        if(targetPropertyIndex != -1){
                                            this.target.classList.remove(properties[0])
                                        }
                                        else
                                            this.target.classList.add(properties[0])
                                    }

                                    this.sendEventToHub('toggle');
                                    break;
                            }
                        break;
                        
                    case 'style':
                            switch(operationType){

                                case 'set': 
                                    //Only objects or strings
                                    if( typeof this.property !== 'string' || Array.isArray(this.property))
                                        return;
                                    //Setting a string is easy
                                    if(typeof this.property === 'string')
                                        this.target.style.cssText = this.property;
                                    //Setting as an object is harder
                                    else{
                                        properties = JSON.parse(JSON.stringify(this.property));
                                        this.setCSSProperties(this.target,properties, 'set');
                                    }
                                    this.sendEventToHub('set');
                                    break;

                                case 'add': 
                                    //Only objects
                                    if( typeof this.property !== 'object' || Array.isArray(this.property))
                                        return;
                                    properties = Array.from(this.property);
                                    this.setCSSProperties(this.target,properties, 'add');
                                    this.sendEventToHub('add');
                                    break;

                                case 'remove': 
                                    //Only objects
                                    if( typeof this.property !== 'object' || Array.isArray(this.property))
                                        return;
                                    properties = JSON.parse(JSON.stringify(this.property));
                                    this.setCSSProperties(this.target,properties, 'remove');
                                    this.sendEventToHub('remove');
                                    break;

                                case 'toggle':
                                    this.sendEventToHub('toggle');
                                    break;
                            }
                        break;

                    case 'event':
                            switch(operationType){

                                case 'set': 
                                    this.sendEventToHub('set');
                                    break;

                                case 'add': 
                                    this.sendEventToHub('add');
                                    break;

                                case 'remove': 
                                    this.sendEventToHub('remove');
                                    break;

                                case 'toggle':
                                    this.sendEventToHub('toggle');
                                    break;
                            }

                        break;
                };
                //console.log(this.targetType,operationType, this.property);
            },
            locatePropertyInClasslist: function(propertyArray, target){
                let res = -1;
                for (let i = 0; i< target.classList.length; i++){
                    res = propertyArray.indexOf(target.classList[i]);
                    if(res!=-1)
                        return res;
                }
            },
            setCSSProperties: function(target,properties, action = 'set'){
                //Split initial css text
                let cssProperties = target.style.cssText.split(';');
                delete cssProperties[cssProperties.length];

                //Set split and existing properties
                cssProperties.forEach(function(item, index){
                    cssProperties[index] = cssProperties[index].split(':');
                    if(properties[cssProperties[index][0]] !== undefined){
                        //Eithe we overwrite existing properties, or not.
                        if(action === 'set')
                            cssProperties[index][1] = properties[cssProperties[index][0]];
                        else if(action === 'remove')
                            delete cssProperties[index];
                        delete properties[cssProperties[index][0]];
                    }
                });

                //Add new properties
                if(action !== 'remove')
                    properties.forEach(function(item, index){
                        cssProperties.push([index,item]);
                    });
                //Or filtering empty spaces in the array
                else
                    cssProperties = cssProperties.filter(function (el) {
                        return el != null;
                      });

                //Join back all properties
                cssProperties.forEach(function(item, index){
                    cssProperties[index] = cssProperties[index].join(':');
                });

                //Join back css text
                cssProperties[cssProperties.length] = '';
                target.style.cssText = cssProperties.join(';');
            },
            sendEventToHub: function(type){
                eventHub.$emit(
                    'buttonEvent', 
                    {
                        type: type,
                        sender: 'controlButton',
                        senderID: this.controllerID,
                        index: this.buttonIndex
                    }
                );
            }
        },
        created: function(){
        }

    });