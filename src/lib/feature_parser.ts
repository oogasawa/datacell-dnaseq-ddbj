
import * as yargs from "yargs";
import lineByLine from "n-readlines";
import objectPath from "object-path";
import * as sprintf_js from "sprintf-js";
const sprintf = sprintf_js.sprintf;






/**  
 * 
 * @param fname
 */
export function parse_features(fname: string): void {
    const liner = new lineByLine(fname);

    let line: false | Buffer;
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
            if (objectPath.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }
            state = 0; // initial state
            continue;
        }
        if (state < 2 && m != null) {
            // console.error(sprintf("Unexpected Error (3, state %d): line %d\t%s", state, lineNo, line));

            if (objectPath.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }

            // state = 1;
            continue;
        }



        m = p4.exec(line.toString()); // end of an entry
        if (m != null) {
            if (objectPath.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }
            state = 0; // initial state
            continue;
        }



        m = f0.exec(line.toString()); // a feature line (CDS, source, etc.)
        if (state >= 2 && m != null) { // matched in a feature table

            if (objectPath.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }


            objectPath.set(data, "feature.name", m[1]);
            objectPath.set(data, "feature.range", m[2]);
            state = 3; // a feature
            continue;
        }
        if (state < 2 && m != null) {
            console.error(sprintf("Unexpected Error (4, state %d): line %d\t%s", state, lineNo, line));
            continue;
        }



        m = f1.exec(line.toString()); // a feature qualifier line.
        if (state >= 3 && m != null) { // matched in a feature

            if (objectPath.has(data, "feature.qualifier")) {
                print_feature_qualifier(data);
                clear_feature_qualifier(data);
            }


            objectPath.set(data, "feature.qualifier", m[1]);
            objectPath.set(data, "feature.value", m[2]);
            state = 4; // feature value
            continue;
        }
        if (state < 3 && m != null) {
            console.error(sprintf("Unexpected Error (5, state %d): line %d\t%s", state, lineNo, line));
            continue;
        }



        m = f2.exec(line.toString()); // feature value
        if (state === 4 && m != null) { // feature value continues.
            let val: string = objectPath.get(data, "feature.value");
            val = val.concat("\\n", m[1]);
            objectPath.set(data, "feature.value", val);
            continue;
        }

    }

}



function print_feature_qualifier(data: object): void {

    let category = "feature";
    let id = {
        accession: objectPath.get(data, "accession"),
        feature: objectPath.get(data, "feature.name"),
        range: objectPath.get(data, "feature.range")
    };
    let predicate = objectPath.get(data, "feature.qualifier");
    let value = objectPath.get(data, "feature.value");

    predicate = predicate.replace('/', 'Q_');
    console.log([category, JSON.stringify(id), predicate, value].join("\t"));

}


function clear_feature_qualifier(data: object): void {
    objectPath.del(data, "feature.qualifier");
    objectPath.del(data, "feature.value");
}



// main();

