.PHONY: init

init:
	cd aws_stack && terraform init -var="aws_profile=$(AWS_PROFILE)" -lock=false

