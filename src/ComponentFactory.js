import React from 'react';
import _ from 'underscore';
import { Field } from 'redux-form';

// component definitions
export default class ComponentFactory {

    constructor() {
        // this is expected to contain a property for each supported type
        // and this property's value is expected to be an array of ComponentBuilder
        this.fieldComponentsByType = { };

        // this is expected to contain a property for each component definition
        // and the value is expected to be the component definition itself
        this.fieldComponentsById = { };

        // defaultFieldComponents is expected to contain a property for each supported type
        // and this property's value is expected to be the component definition id
        this.defaultFieldComponents = { };

        // this is expected to contain a property for each component definition
        // and the value is expected to be the component definition itself
        this.groupComponentsById = { };

        // The id of the default component for groups
        this.defaultGroupComponentId = null;

        // This this a list of Root components
        this.rootComponentsById = { };

        this.currentRoot = null;

    }

    /**
     * Validates the given metadata
     * @param metadata
     */
    _validateMetadata(metadata) {
        if(!metadata)
            throw "Metadata should not be null or undefined";
        if(!metadata.type)
            throw "Metadata should have a type";
        if(!metadata.name)
            throw "Metadata should have a name";
    }

    /**
     * Registers a component definition
     * @param id
     * @param types
     * @param component
     */

    registerFieldComponent(id, types, component) {
        // registers the component definition in each given type
        for(var i = 0; i < types.length; i++)
        {
            const type = types[i];
            if(!(type in this.fieldComponentsByType))
                this.fieldComponentsByType[type] = [];
            this.fieldComponentsByType[type].push(component);
        }
        // registers the component definition
        this.fieldComponentsById[id] = component;
    }

    /**
     * @param id The ComponentBuilder id
     */
    getFieldComponent(id) {
        var component = this.fieldComponentsById[id];
        if(!component) {
            throw `Could not find the given component. Id: ${id}`;
        }
        return this.fieldComponentsById[id];
    }

    /**
     * Returns the current component definitions.
     * If a type is specified, returns the definitions for that type only
     * @returns {{}|*}
     */
    getFieldComponents(type) {
        if(!type)
            return this.fieldComponentsByType;
        return this.fieldComponentsByType[type];
    }

    /**
     * Returns the default component definition for the given type
     * @param type
     */
    getDefaultFieldComponent(type) {
        if(!type) throw 'type should have a value';
        if(this.defaultFieldComponents[type])
            return this.getFieldComponent(this.defaultFieldComponents[type]);
        const componentsForType = this.getFieldComponents(type);
        const component = _.first(componentsForType);
        if(!component)
            throw new Error(`Couldn't find any component for the given type. Type: ${type}. Make sure the proper component was registered in the ComponentFactory.`);
        return component;
    }

    /**
     * Sets the default component per type.
     * @param components - An object that should contain a type as a key and a ComponentBuilder as value
     */
    setDefaultFieldComponents(components) {
        this.defaultFieldComponents = components;
    }

    /**
     * Gets the appropriate component based on the given metadata
     * @param fieldComponentProps
     * @returns {*}
     */
    buildFieldComponent(fieldComponentProps) {
        if(!fieldComponentProps) throw Error('Argument \'props\' should be truthy');
        
        this._validateMetadata(fieldComponentProps);
        let componentType;
        if(fieldComponentProps.component) {
            // if the metadata explicitly specify a component, let's use it
            componentType = this.getFieldComponent(fieldComponentProps.component);
        }
        else
        {
            // If the metadata doesn't explicitly specify a component, let's return
            // the default component for type. If there's no default, let's take the first
            // that matches the type
            componentType = this.getDefaultFieldComponent(fieldComponentProps.type);
        }
        if(!componentType)
            throw new Error(`Could not resolve the component for the type. Type: ${fieldComponentProps.type}`);

        var component = React.createElement(componentType, Object.assign({}, fieldComponentProps, fieldComponentProps.reduxFormProps));

        // if there's a 'reduxFormProps' metadata, it should be merged with the 
        return <Field name={fieldComponentProps.name} component={component} />;
    }

    /**
     * Registers a group component
     * @param id
     * @param component
     */
    registerGroupComponent(id, component) {
        this.groupComponentsById[id] = component;
    }

    getGroupComponent(id) {
        let component = this.groupComponentsById[id];
        if(!component) {
            throw Error(`Could not resolve the group component. Component: ${id}`);
        }
        return component;
    }

    /**
     * Sets the default group component
     * @param id
     */
    setDefaultGroupComponent(id) {
        this.defaultGroupComponentId = id;
    }

    /**
     * Gets the default group component
     * @returns {*}
     */
    getDefaultGroupComponent() {
        return this.getGroupComponent(this.defaultGroupComponentId);
    }

    /**
     * Gets the appropriate component based on the given metadata
     * @param groupComponentProps
     * @returns {*}
     */
    buildGroupComponent(groupComponentProps) {
        if(!groupComponentProps) {
            throw Error('The props parameter is required');
        }

        let componentType;
        if(groupComponentProps.component) {
            // if the metadata explicitly specify a component, let's use it
            componentType = this.getGroupComponent(groupComponentProps.component);
        }
        else
        {
            // If the metadata doesn't explicitly specify a component, let's return
            // the default component for type. If there's no default, let's take the first
            // that matches the type
            componentType = this.getDefaultGroupComponent();
        }
        if(!componentType)
            throw new Error(`Could not resolve the component for the group`);

        return React.createElement(componentType, groupComponentProps);
    }


    // Allows to register a new Root component
    registerRootComponent(id, component) {
        this.rootComponentsById[id] = component;
    }

    // Allows to define the id of the current Root component that should be used
    setCurrentRoot(id) {
        this.currentRoot = id;
    }

    // Return the selected Root component in AutoformInternal
    getRoot() {
        return this.rootComponentsById[this.currentRoot];
    }
}