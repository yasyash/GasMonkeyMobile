/*is_alert*/

DECLARE
	typemeasure varchar(32);
   /* mcursor CURSOR FOR SELECT * FROM macs WHERE macs.chemical = typemeasure;*/
	rec record;
	station record;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			typemeasure = NEW.typemeasure;
			 /*OPEN mcursor;
	  		 FETCH mcursor INTO rec;*/
			 SELECT * INTO station FROM stations WHERE stations.idd = NEW.idd;
			 IF (typemeasure != 'Темп. внутренняя') THEN
			 	SELECT * INTO rec FROM macs WHERE macs.chemical = typemeasure;

				/*RAISE NOTICE 'Is alert: % ', (rec.max_m <= NEW.measure);*/
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
			ELSE
					IF ((NEW.measure) > 35) THEN
					 INSERT INTO logs (  date_time, type, descr)  VALUES (NEW.date_time, 120, 
					 ( 'Превышение '|| NEW.typemeasure || ' - зафиксировано станцией наблюдения '|| station.namestation||' . Значение внутренней температуры ' || NEW.measure || ' C.'));
					 NEW.is_alert := true;
					END IF;
					RETURN NEW;
		
			END IF;
	 	END IF;
	END;

/*___________________________________________________________________________________________________*/
/*fire_alrm*/

DECLARE
	code_hack varchar(4) = 'E139';
	code_fire varchar(4) = 'E110';
	code_smoke varchar(4) = 'E111';	
	code_flame varchar(4) = 'E112';
	station 			    record;
	fire	 			    record;
	door	 			    record;



	BEGIN
		IF (TG_OP = 'INSERT') THEN
		 SELECT * INTO station FROM stations WHERE stations.idd = NEW.idd;
		 
			IF (NEW.surgard = code_hack) THEN
	  				NEW.is_alert := true;
					 INSERT INTO logs (  date_time, type, descr)  VALUES (NEW.date_time_in, 110, 
					 ( 'Проникновение! Тревога! На '|| station.namestation || ' - зафиксировано постом наблюдения Id='|| station.idd||' .'));
	
			END IF;
			IF (NEW.surgard = code_fire) THEN
	  				NEW.is_alert := true;
					INSERT INTO logs (  date_time, type, descr)  VALUES (NEW.date_time_in, 111, 
					 ( 'Пожар! Тревога! На '|| station.namestation || ' - зафиксировано постом наблюдения Id='|| station.idd||' .'));
			END IF;
			IF (NEW.surgard = code_smoke) THEN
	  				NEW.is_alert := true;
					INSERT INTO logs (  date_time, type, descr)  VALUES (NEW.date_time_in, 111, 
					 ( 'Задымление! Тревога! На '|| station.namestation || ' - зафиксировано постом наблюдения Id='|| station.idd||' .'));
			END IF;
			IF (NEW.surgard = code_flame) THEN
	  				NEW.is_alert := true;
					INSERT INTO logs (  date_time, type, descr)  VALUES (NEW.date_time_in, 111, 
					 ( 'Пламя - пожар! Тревога! На '|| station.namestation || ' - зафиксировано постом наблюдения Id='|| station.idd||' .'));
			END IF;
			
			if (NEW.is_alert) THEN
					  SELECT * INTO door FROM equipments WHERE equipments.idd = NEW.idd AND equipments.typemeasure = 'Дверь';
	 
       			if ( FOUND AND  NEW.surgard = code_hack) THEN
					 INSERT INTO sensors_data (idd, serialnum, date_time, typemeasure, measure, is_alert) values (door.idd, door.serialnum, NEW.date_time_in,'Дверь', 255, true );
				END IF;
				
			  SELECT * INTO fire FROM equipments WHERE equipments.idd = NEW.idd AND equipments.typemeasure = 'Пожар';
				
				if ( FOUND AND NEW.surgard = code_fire ) OR  ( FOUND AND NEW.surgard = code_smoke ) OR ( FOUND AND NEW.surgard = code_flame )THEN
					 INSERT INTO sensors_data (idd, serialnum, date_time, typemeasure, measure, is_alert) values (fire.idd, fire.serialnum, NEW.date_time_in,'Пожар', 255, true );
				END IF;
			
			END IF;
		    RETURN NEW;
		ELSE
			RETURN NEW;
	 	END IF;
	END;




