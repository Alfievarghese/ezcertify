CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificate_id" varchar(16) NOT NULL,
	"bound_column_name" varchar(255) NOT NULL,
	"bound_column_value" text NOT NULL,
	"extra_display_fields" jsonb DEFAULT '{}',
	"template_name" varchar(255),
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_certificate_id_unique" UNIQUE("certificate_id")
);
