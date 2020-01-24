export const TD_API: TD_API = {
    functions: __functions,
    constructors: __constructors,
    classes: __classes as any,
};
export namespace TD_API {
    export type ParameterType = constructorParamType | classParamType | vectorParamType;
    export interface constructorTypeFunction {
        "@type": "constructorTypeFunction";
        name: string;
        parameters: parameter[];
        type_mode: "Function";
        returns: string;
        description?: string;
    }
    export interface parameter {
        "@type": "parameter";
        name: string;
        type: ParameterType;
        description?: string;
    }
    export interface constructorParamType {
        "@type": "constructorParamType";
        constructorName: string;
    }
    export interface classParamType {
        "@type": "classParamType";
        className: string;
    }
    export interface vectorParamType {
        "@type": "vectorParamType";
        of_type: ParameterType;
    }
    export interface constructorTypeObject {
        "@type": "constructorTypeObject";
        name: string;
        type_mode: "Constructor";
        parameters: parameter[];
        constructs: string;
        description?: string;
    }
    export interface classType {
        "@type": "classType";
        name: string;
        constructors: string[];
        functions: string[];
        description?: string;
    }
}
export interface TD_API {
    functions: TD_API.constructorTypeFunction[];
    constructors: TD_API.constructorTypeObject[];
    classes: TD_API.classType[];
}
