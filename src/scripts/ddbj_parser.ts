
import yargs, { Argv } from "yargs";
import { parse_entries, parse_features } from "../lib/index";
import lineByLine from "n-readlines";

main();


function main(): void {

    let argv = yargs
        .command('entry', "Entry parser")
        .command('feature', "Feature parser")
        .option('file_list', {
            alias: 'l',
            describe: "A file name having a list of *.seq files",
            default: ""
        })
        .option('job_id', {
            alias: 'n',
            describe: "job ID in a UGE/slurm array job",
            default: 0
        })
        .option('base_dir', {
            alias: 'b',
            describe: "Base directory of the listed files",
            default: "./"
        })
        .option('file', {
            alias: 'f',
            describe: "A *.seq file",
            default: ""
        })
        .demandCommand(1)
        .help()
        .argv;


    // set a file name of *.seq file.
    let seqFile = "";
    if (argv.file_list) {
        seqFile = argv.base_dir + get_seq_file(argv.file_list, argv.job_id);
    }
    else {
        seqFile = argv.base_dir + argv.file;
    }

    // call parse functions.
    if (argv._[0] === "entry") {
        parse_entries(seqFile);
    }
    else if (argv._[0] === "feature") {
        parse_features(seqFile);
    }
}



function get_seq_file(listfile: string, n: number): string {

    const liner = new lineByLine(listfile);
    let line: false | Buffer;

    let result: string = null;
    let lineNo: number = 1;
    while (line = liner.next()) {
        if (lineNo === n) {
            result = line.toString();
            break;
        }
        lineNo++;
    }

    return result;
}
