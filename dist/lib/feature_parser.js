"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_features = void 0;
const n_readlines_1 = __importDefault(require("n-readlines"));
const object_path_1 = __importDefault(require("object-path"));
const sprintf_js = __importStar(require("sprintf-js"));
const sprintf = sprintf_js.sprintf;
/**
 *
 * @param fname
 */
function parse_features(fname) {
    const liner = new n_readlines_1.default(fname);
    let line;
    const p1 = /^ACCESSION\s+(\S+)/;
    const p2 = /^FEATURES\s+(\S+)/;
    const p3 = /^(\S+)/;
    const p4 = /^\/\//;
    const f0 = /^\s{5}([A-Za-z]\S+)\s+(\S+)/;
    const f1 = /^\s+(\/\S+)=(.+)/;
    const f2 = /^\s+(.+)/;
    let data = {};
    let state = 0;
    let lineNo = 0;
    while (line = liner.next()) {
        lineNo++;
        // if (lineNo > 500) {
        //     break;
        // }
        // console.log(sprintf("%d  %s", state, line.toString()));
        let m = p1.exec(line.toString()); // an ACCESSION line
        if (state <= 1 && m != null) { // matched
            data["accession"] = m[1];
            state = 1;
            continue;
        }
        if (state !== 0 && m != null) { // unexpected situation
            console.error(sprintf("Unexpected Error (1: state %d): line %d\t%s", state, lineNo, line));
            continue;
        }
        m = p2.exec(line.toString()); // a FEATURES line.
        if (state === 1 && m != null) { // matched!!
            state = 2; // in a feature table
            continue;
        }
        if (state !== 1 && m != null) { // unexpected situation
            console.error(sprintf("Unexpected Error (2, state %d, %s): line %d\t%s", state, data["accession"], lineNo, line));
            continue;
        }
        m = p3.exec(line.toString()); // an other header line
        if (state >= 2 && m != null) { // prev state === feature table or feature qualifier
            // if it exists, print feature qualifier data.
            if (object_path_1.default.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }
            state = 0; // initial state
            continue;
        }
        if (state < 2 && m != null) {
            // console.error(sprintf("Unexpected Error (3, state %d): line %d\t%s", state, lineNo, line));
            if (object_path_1.default.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }
            // state = 1;
            continue;
        }
        m = p4.exec(line.toString()); // end of an entry
        if (m != null) {
            if (object_path_1.default.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }
            state = 0; // initial state
            continue;
        }
        m = f0.exec(line.toString()); // a feature line (CDS, source, etc.)
        if (state >= 2 && m != null) { // matched in a feature table
            if (object_path_1.default.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }
            object_path_1.default.set(data, "feature.name", m[1]);
            object_path_1.default.set(data, "feature.range", m[2]);
            state = 3; // a feature
            continue;
        }
        if (state < 2 && m != null) {
            console.error(sprintf("Unexpected Error (4, state %d): line %d\t%s", state, lineNo, line));
            continue;
        }
        m = f1.exec(line.toString()); // a feature qualifier line.
        if (state >= 3 && m != null) { // matched in a feature
            if (object_path_1.default.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }
            object_path_1.default.set(data, "feature.qualifier", m[1]);
            object_path_1.default.set(data, "feature.value", m[2]);
            state = 4; // feature value
            continue;
        }
        if (state < 3 && m != null) {
            console.error(sprintf("Unexpected Error (5, state %d): line %d\t%s", state, lineNo, line));
            continue;
        }
        m = f2.exec(line.toString()); // feature value
        if (state === 4 && m != null) { // feature value continues.
            let val = object_path_1.default.get(data, "feature.value");
            val = val.concat("\\n", m[1]);
            object_path_1.default.set(data, "feature.value", val);
            continue;
        }
    }
}
exports.parse_features = parse_features;
function print_feature_qualifier(data) {
    let category = "feature";
    let id = {
        accession: object_path_1.default.get(data, "accession"),
        feature: object_path_1.default.get(data, "feature.name"),
        range: object_path_1.default.get(data, "feature.range")
    };
    let predicate = object_path_1.default.get(data, "feature.qualifier");
    let value = object_path_1.default.get(data, "feature.value");
    predicate = predicate.replace('/', 'Q_');
    console.log([category, JSON.stringify(id), predicate, value].join("\t"));
}
function clear_feature_qualifier(data) {
    object_path_1.default.del(data, "feature.qualifier");
    object_path_1.default.del(data, "feature.value");
}
// main();
