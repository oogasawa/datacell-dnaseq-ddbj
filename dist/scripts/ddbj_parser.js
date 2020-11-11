"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const index_1 = require("../lib/index");
const n_readlines_1 = __importDefault(require("n-readlines"));
main();
function main() {
    let argv = yargs_1.default
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
        index_1.parse_entries(seqFile);
    }
    else if (argv._[0] === "feature") {
        index_1.parse_features(seqFile);
    }
}
function get_seq_file(listfile, n) {
    const liner = new n_readlines_1.default(listfile);
    let line;
    let result = null;
    let lineNo = 1;
    while (line = liner.next()) {
        if (lineNo === n) {
            result = line.toString();
            break;
        }
        lineNo++;
    }
    return result;
}
