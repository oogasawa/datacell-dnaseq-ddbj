
import lineByLine from "n-readlines";
import objectPath from "object-path";


/**  
 * 
 * @param fname
 */
export function parse_entries(fname: string): void {
    const liner = new lineByLine(fname);

    let line: false | Buffer;
    const pDefinition = /^DEFINITION\s+(\S.+)/;
    const pOtherLine = /^\s+(\S.+)/;
    const pAccession = /^ACCESSION\s+(\S+)/;
    const pOrganism = /^\s+ORGANISM\s+(.+)/;
    const pOtherHeader = /^(\S+)/;
    const pEnd = /^\/\//;


    let data = {};
    let state = 0;
    let lineNo = 0;
    while (line = liner.next()) {

        lineNo++;

        // if (lineNo > 200) {
        //     break;
        // }

        // console.log(sprintf("%d  %s", state, line.toString()));


        let m = pDefinition.exec(line.toString());
        if (m != null) { // matched!!
            objectPath.set(data, "definition", m[1]);
            state = 1;
            continue;
        }


        m = pOtherLine.exec(line.toString());
        if (state === 1 && m != null) {
            let definition: string = objectPath.get(data, "definition");
            definition = definition.concat(" ", m[1]);
            objectPath.set(data, "definition", definition);
            state = 2;
            continue;
        }


        m = pAccession.exec(line.toString());
        if (m != null) { // matched!!
            objectPath.set(data, "accession", m[1]);

            print_definition(data);

            state = 0;
            continue;
        }


        m = pOrganism.exec(line.toString());
        if (m != null) { // matched!!
            objectPath.set(data, "organism", m[1]);

            print_organism(data);

            state = 0;
            continue;
        }



        m = pOtherHeader.exec(line.toString());
        if (m != null) { // matched!!
            state = 0;
            continue;
        }
    }

}


function print_definition(data: object): void {

    let category: string = "entry";
    let id: string = objectPath.get(data, "accession");
    let predicate: string = "definition";
    let value: string = objectPath.get(data, "definition");

    console.log([category, id, predicate, value].join("\t"));

}



function print_organism(data: object): void {

    let category: string = "entry";
    let id: string = objectPath.get(data, "accession");
    let predicate: string = "organism";
    let value: string = objectPath.get(data, "organism");

    console.log([category, id, predicate, value].join("\t"));

}


// main();

