#!/bin/bash

#$ -cwd
#$ -t 1-1181
#$ -V

BASEDIR=$HOME/works/datacell-dnaseq-ddbj

cd $BASEDIR/data

$BASEDIR/datacell-dnaseq-ddbj-linux entry \
	-l seq_files.txt -n $SGE_TASK_ID \
	-b $BASEDIR/data/ 
