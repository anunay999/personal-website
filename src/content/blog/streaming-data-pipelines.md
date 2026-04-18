---
title: Building Low Latency Streaming Data Pipelines — Part 1
date: 2024-04-20
read: 8 min
tag: systems
excerpt: A walkthrough of streaming ETL — the platforms, the workflow, scaling under load, and how Delta Live Tables collapses most of the boilerplate into a declarative pipeline.
slug: streaming-data-pipelines
---

As an engineer, I know firsthand the challenge of keeping up with the ever-growing amounts of data generated in real time. The demand for low-latency streaming ETL pipelines is at an all-time high. I'm here to share my learnings and experiences building these tools — cutting-edge techniques and technologies revolutionizing real-time data handling.

## Streaming platforms

Event streaming refers to a data processing architecture where real-time data is continuously ingested, processed, and delivered in an organized manner. AWS Kinesis, Apache Kafka, Amazon MSK, Confluent Cloud, and Azure Event Hubs are popular event streaming platforms that allow for scalable, fault-tolerant, low-latency data processing. These platforms provide a central hub for ingesting and distributing real-time data streams for further processing and analysis.

A generic workflow for these tools looks like this:

- **Data collection** — data is collected from various sensors, logs, databases, and APIs.
- **Data ingestion** — the collected data is ingested into the event streaming platform.
- **Data processing** — the ingested data is processed in real time to extract insights, trigger events, and perform actions. This may involve data enrichment, transformation, and analysis.
- **Data storage** — the processed data is stored in a database, data warehouse, or data lake for future analysis and reporting.
- **Data visualization** — the processed data is visualized using dashboards and reports to gain insights and make informed decisions.

![Streaming pipeline workflow](https://substackcdn.com/image/fetch/$s_!Y3MF!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb571c80a-5f53-49d8-8900-7a14ad7ce8cd_2440x921.png)

Streaming workflows are popular because big data and IoT generate volumes that batch processing can't handle. Streaming pipelines let new data feed analytics and ML for faster, better decisions and improved customer experiences — organizations react quickly and improve operations in near real time.

## Building a data pipeline with Apache Kafka

A general overview of the steps to build a streaming pipeline with Apache Kafka:

- **Set up a Kafka cluster** — on-premise, in the cloud, or via a managed service like Confluent Cloud.
- **Define the Kafka topics** — a topic is a category or feed name to which records are published. Define the topics you need and configure replication, partitioning, and other settings.
- **Produce data to the topics** — write producers in Java, Python, C++, or any supported language.
- **Write a consumer application** — a consumer reads from the topics and processes records to your requirements.
- **Store processed data** — land the output in a database, data lake, or any other storage system.
- **Monitor the pipeline** — keep it healthy and troubleshoot quickly. Tools like Confluent Control Center or Metrics Reporter help.

## Handling high-volume data workloads

Heavy workloads affect latency and pipeline performance. To keep up with demand, autoscale:

- **Monitor pipeline metrics** — incoming volume, processing time, resource utilization.
- **Set thresholds** — pick numbers per metric that trigger autoscaling based on acceptable end-to-end latency.
- **Trigger autoscaling** — add or remove resources (e.g. nodes in a cluster) to maintain optimal performance.
- **Use autoscaling tools** — AWS Auto Scaling, Databricks DLT, Google Cloud Auto Scaling, Azure Autoscale.
- **Test and refine** — re-run the autoscaling process regularly and adjust thresholds as the workload changes.

The above can be tedious for someone just starting to build or incorporate these workflows into existing architectures. To overcome that hurdle and set up resilient pipelines, let's lean on Databricks Delta Live Tables (DLT) — it dramatically simplifies onboarding.

![Delta Live Tables architecture](https://substackcdn.com/image/fetch/$s_!Y3MF!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb571c80a-5f53-49d8-8900-7a14ad7ce8cd_2440x921.png)

## Delta Live Tables (DLT)

DLT is a framework from Databricks that makes ETL pipelines easier to build and maintain. It uses a simple declarative approach and fully manages batch and streaming infrastructure, freeing users to focus on analysis and insights. It's designed for real-time data and can handle low-latency pipelines directly from event buses like Apache Kafka — ideal for teams that want to simplify their ETL process and gain real-time insights.

- DLT can be declared with a standard SQL `CREATE TABLE AS SELECT` (CTAS) statement using the `LIVE` keyword.
- In Python, the `@dlt.table` decorator creates a Delta Live Table that can ingest directly from Kafka via Spark Structured Streaming.
- The state of the pipeline is automatically managed, so you don't need manual checkpointing.

That makes creating and maintaining fast, low-latency ETL pipelines a lot easier than building the end-to-end workflow by hand.

---

Look out for this space for **Part 2** — how to practically bootstrap an ETL workflow using DLT and Kafka.

Originally published on [Anunay's Newsletter](https://anunayaatipamula.substack.com/p/building-low-latency-streaming-data).
