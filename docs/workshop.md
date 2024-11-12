---
published: true
type: workshop
title: Use Azure Communication Services to build a chat application with Teams
short_title:
description: Discover how to integrate Azure Communication Services with Microsoft Teams to build a chat application.
level: beginner # Required. Can be 'beginner', 'intermediate' or 'advanced'
navigation_numbering: false
authors: # Required. You can add as many authors as needed
  - Lucas Peirone
  - Damien Aicheh
contacts: # Required. Must match the number of authors
  - "@lucas.peirone"
  - "@damienaicheh"
duration_minutes: 60
tags: azure, azure communication services, microsoft teams, javascript, codespace, devcontainer, csu
navigation_levels: 3
---

# Product Hands-on Lab - Azure Communication Services with Microsoft Teams

Welcome to this Azure Communication Services Workshop. You will learn how to integrate Azure Communication Services with Microsoft Teams to build a chat application. Don't worry, even if the challenges will increase in difficulty, this is a step by step lab, you will be guided through the whole process.

During this workshop you will have the instructions to complete each steps. It is recommended to search for the answers in provided resources and links before looking at the solutions placed under the 'Toggle solution' panel.

<div class="task" data-title="Task">

> You will find the instructions and expected configurations for each Lab step in these yellow **TASK** boxes.
>
> Inputs and parameters to select will be defined, all the rest can remain as default as it has no impact on the scenario.
>
> Log into your Azure subscription locally using Azure CLI and on the [Azure Portal][az-portal] using your own credentials.
>
> Instructions and solutions will be given for the Azure CLI, but you can also use the Azure Portal if you prefer.

</div>

## Naming conventions

Before starting to deploy any resource in Azure, it's important to follow a naming convention to ensure resource name uniqueness and ease their identification. Based on the official [documentation][az-naming-convention] you need to define a few things:

- The application name
- The environment
- The region
- The instance number

You will also add an owner property, so for the purpose of this lab the values will be:

- The service prefix: `acs` (for Azure Communication Services)
- The environment: `dev`
- The region: `we` (for West Europe)
- The application name: `hol` (for Hands On Lab)
- The owner: `ms`
- The instance: `01`

You will use this convention for the rest of the scenario:

```xml
<!--If the resource prefix has a dash: -->
<service-prefix>-<environment>-<region>-<application-name>-<owner>-<instance>
<!--If the resource does not autorize any special caracters: -->
<service-prefix><environment><region><application-name><owner><instance>
```

<div class="info" data-title="Note">

> Be sure to use **your own values** to have unique names or use your own convention.
> [Official resource abbreviations][az-abrevation]
>
> Some services like Azure Storage Account or Azure KeyVault have a maximum size of 24 characters, so please consider using relevant abbreviations as small as possible.

</div>

# Prerequisites

## Dev Environment Setup

To retrieve the lab content :

- A Github account (Free, Team or Enterprise)
- Create a [fork][Repo-fork] of the repository from the **main** branch to help you keep track of your changes

3 development options are available:

- _Preferred method_ : Pre-configured GitHub Codespace
- Local Devcontainer
- Local Dev Environment with all the prerequisites detailed below

<div class="tip" data-title="Tips">

> To focus on the main purpose of the lab, we encourage the usage of devcontainers/codespace as they abstract the dev environment configuration, and avoid potential local dependencies conflict.
>
> You could decide to run everything without relying on a devcontainer : To do so, make sure you install all the prerequisites detailed below.

</div>

### Pre-configured GitHub Codespace

To use a Github Codespace, you will need :

- [A GitHub Account][github-account]

Github Codespace offers the ability to run a complete dev environment (Visual Studio Code, Extensions, Tools, Secure port forwarding etc.) on a dedicated virtual machine.
The configuration for the environment is defined in the `.devcontainer` folder, making sure everyone gets to develop and practice on identical environments : No more conflict on dependencies or missing tools !

Every Github account (even the free ones) grants access to 120 vcpu hours per month, _**for free**_. A 2 vcpu dedicated environment is enough for the purpose of the lab, meaning you could run such environment for 60 hours a month at no cost!

To get your codespace ready for the labs, here are a few steps to execute :

- After you forked the repo, click on `<> Code`, `Codespaces` tab and then click on the `+` button:

![codespace-new](./assets/codespace-new.png)

- You can also provision a beefier configuration by defining creation options and select the **Machine Type** you like :

![codespace-configure](./assets/codespace-configure.png)

### Using a local Devcontainer

This repo comes with a Devcontainer configuration that will let you open a fully configured dev environment from your local Visual Studio Code, while still being completely isolated from the rest of your local machine configuration : No more dependancy conflict.
Here are the required tools to do so :

- [Git client][git-client]
- [Docker Desktop][docker-desktop] running
- [Visual Studio Code][vs-code] installed

Open the local repository you just cloned or forked in Visual Studio Code. Make sure Docker Desktop is up and running and open the cloned repository in Visual Studio Code.

You will be prompted to open the project in a Dev Container. Click on `Reopen in Container`.

If you are not prompted by Visual Studio Code, you can open the command palette (`Ctrl + Shift + P`) and search for `Reopen in Container` and select it:

![devcontainer-reopen](./assets/devcontainer-reopen.png)

### Using your own local environment

The following tools and access will be necessary to run the lab in good conditions on a local environment :

- [Git client][git-client]
- [Visual Studio Code][vs-code] installed (you will use Dev Containers)
- [Azure CLI][az-cli-install] installed on your machine
- [Node 22][download-node] with Npm

Once you have set up your local environment, you can clone the Hands-on-lab repository you just forked on your machine, and open the local folder in Visual Studio Code and head to the next step.

## Sign in to Azure

Before starting this lab, be sure to set your Azure environment :

- An Azure Subscription with the **Contributor** role to create and manage the labs' resources
- A dedicated resource group for this lab to ease the cleanup at the end.
- Register the Azure providers on your Azure Subscription if not done yet: `Microsoft.Communication`.

<div class="task" data-title="Task">

> - Log into your Azure subscription in your environment using Azure CLI and on the [Azure Portal][az-portal] using your credentials.
> - Instructions and solutions will be given for the Azure CLI, but you can also use the Azure Portal if you prefer.
> - Register the Azure providers on your Azure Subscription if not done yet: `Microsoft.Communication`

</div>

<details>

<summary>Toggle solution</summary>

```bash
# Login to Azure :
# --tenant : Optional | In case your Azure account has access to multiple tenants

# Option 1 : Local Environment
az login --tenant <yourtenantid or domain.com>
# Option 2 : Github Codespace : you might need to specify --use-device-code parameter to ease the az cli authentication process
az login --use-device-code --tenant <yourtenantid or domain.com>

# Display your account details
az account show
# Select your Azure subscription
az account set --subscription <subscription-id>

# Register the following Azure providers if they are not already

# Azure Communication Services
az provider register --namespace 'Microsoft.Communication'
```

</details>

[az-cli-install]: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
[az-naming-convention]: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming
[az-abrevation]: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations
[az-portal]: https://portal.azure.com
[vs-code]: https://code.visualstudio.com/
[docker-desktop]: https://www.docker.com/products/docker-desktop/
[Repo-fork]: https://github.com/microsoft/hands-on-lab-acs-teams/fork
[git-client]: https://git-scm.com/downloads
[github-account]: https://github.com/join
[download-node]: https://nodejs.org/en

# Lab 0 - Create an Azure Communication Services resource

In this lab, you will create an Azure Communication Services resource to enable communication capabilities in your application.

<div class="task" data-title="Task">

> Create an Azure Communication Services resource in your Azure subscription.
> The naming convention for an Azure Communication Service is: `acs-<environment>-<region>-<application-name>-<owner>-<instance>`

</div>

<details>
<summary>Toggle solution</summary>

Go to the Azure Portal and create a new resource by searching for `Azure Communication Services`.

Make sure to select the right subscription and resource group or create one, and choose a unique name for your Azure Communication Service resource.

![create-acs](./assets/create-acs-resource.png)

</details>

# Lab 1 - Create a call between two ACS users

In this lab, you will create a call between two users using Azure Communication Services.

To start this lab you will use the code inside `src/add-1-on-1-acs`

# Lab 2 - Interact with Azure Communication Services and Microsoft Teams

## Create a server

## Create a chat

## Create a call

## Create a video call

# Lab 3 - Call a phone number

Let's use the Azure Communication Services to call a phone number. First step is to go to the Azure Communication Services resource you created in the first lab and inside the `Phone Numbers` tab, you will need to buy a phone number.

<div class="task" data-title="Task">

> Buy a `Toll-free` phone number inside the Azure Communication Services resource.

</div>

<details>
<summary>Toggle solution</summary>

Click on the `+ Get` button to buy a new phone number. Select a country and the `Toll-free` option, then click on `Search`.

Select one of the available phone numbers and click on add `Add to cart`. Click on `Review + buy` and then `Buy`.

</details>

---

# Closing the workshop

Once you're done with this lab you can delete the resource group you created at the beginning.

To do so, click on `delete resource group` in the Azure Portal to delete all the resources and audio content at once. The following Az-Cli command can also be used to delete the resource group :

```bash
# Delete the resource group with all the resources
az group delete --name <resource-group>
```
