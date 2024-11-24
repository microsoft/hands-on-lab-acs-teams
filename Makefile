.PHONY: workshop
.DEFAULT_GOAL := workshop

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
WS_DIR=$(ROOT_DIR)/docs/workshop.md

# Launch the workshop dev server
workshop:
	moaw serve "$(WS_DIR)" -h 0.0.0.0