DECLARE
	typemeasure varchar(32);
	rec record;
	station record;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			typemeasure = NEW.typemeasure;
		
			 SELECT * INTO rec FROM macs WHERE macs.chemical = typemeasure;
 			 SELECT * INTO station FROM stations WHERE stations.idd = NEW.idd;

	 			 IF (rec.max_m <= NEW.measure) THEN
				/*RAISE NOTICE 'alert: % ', NEW.measure;*/
	 
	  				NEW.is_alert := true;
					IF ((NEW.measure/rec.max_m) < 5) THEN
					 INSERT INTO logs (  date_time, type, descr)  VALUES (NEW.date_time, 100, 
					 ( 'Превышение ПДК по показателю - '|| NEW.typemeasure || ' - зафиксировано станцией наблюдения '|| station.namestation||' .'));

					ELSE 
				 		IF ((NEW.measure/rec.max_m) < 10) THEN
						 INSERT INTO logs (  date_time, type, descr)  VALUES (NEW.date_time, 101, 
						  ('Превышение ПДК, более чем в 5 раз, по показателю - ' || NEW.typemeasure || ' - зафиксировано станцией наблюдения '|| station.namestation||' .'));
																			  
						ELSE
						 INSERT INTO logs (  date_time, type, descr)  VALUES (NEW.date_time, 102, 
						  ('Превышение ПДК, более чем в 10 раз, по показателю - ' || NEW.typemeasure || ' - зафиксировано станцией наблюдения '|| station.namestation||' .'));
									  
						END IF;													  
					END IF;
																		  
				 	RETURN NEW; 
				  ELSE  
					  RETURN NEW;
	  			END IF;
	 	END IF;
	END;
